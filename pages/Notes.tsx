import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { getCourses, addCourse } from '../services/courseService';
import { getNotes, addTextNote, uploadNoteFile, deleteNote, getFlashcards, addFlashcards, updateFlashcard, updateNoteContent } from '../services/notesService';
import { type Note, type Course, type Flashcard as FlashcardType } from '../types';
import { PageHeader, Button, Input, Textarea, Select, Modal, Spinner } from '../components/Common/ui';
import { PlusCircle, Trash2, Upload, FileText, BookOpen, Layers, X, Brain, Edit, Save, ArrowLeft, Download, Eye, EyeOff, Wand2, Lightbulb, GraduationCap } from 'lucide-react';
import { generateFlashcards, extractTextFromFile, summarizeText, generateQuizFromContent, analyzeNoteContent } from '../services/geminiService';
import DOMPurify from 'dompurify';
import { useNavigate } from 'react-router-dom';
import Flashcard from '../components/Common/Flashcard';

// Helper function
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (!result || !result.includes(',')) {
        return reject(new Error("Invalid file data for base64 conversion"));
      }
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

const Notes: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  // --- State Management ---
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [editedContent, setEditedContent] = useState('');

  const [flashcards, setFlashcards] = useState<FlashcardType[]>([]);

  const [activeTab, setActiveTab] = useState<'notes' | 'flashcards'>('notes');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false); // Loading state for note-based generation
  const [isFileGenerating, setIsFileGenerating] = useState(false); // Loading state for file-based generation
  const [isSingleGenerating, setIsSingleGenerating] = useState<string | null>(null); // Track which note ID is generating

  // --- Summarization State ---
  const [isSummarizing, setIsSummarizing] = useState(false);

  // --- Quiz Generation State ---
  const [isQuizGenerating, setIsQuizGenerating] = useState(false);

  // --- Note Analysis State ---
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyzeNote = async (note: Note) => {
    if (!note.content || isAnalyzing) return;
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeNoteContent(note.content);
      // Update local state to show results immediately (in a real app, save to backend)
      const updatedNote = { ...note, tags: analysis.tags, concepts: analysis.concepts };
      setNotes(prev => prev.map(n => n.id === note.id ? updatedNote : n));
      if (activeNote?.id === note.id) {
        setActiveNote(updatedNote);
      }
      alert("Note analysis complete!");
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("Failed to analyze note.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSummarize = async (note: Note) => {
    if (!note.content || !selectedCourse || isSummarizing) return;
    setIsSummarizing(true);
    try {
      const summary = await summarizeText(note.content);
      await addTextNote(selectedCourse, `Summary: ${note.title}`, summary);
      reloadNotes();
      alert("Summary created as a new note!");
    } catch (error) {
      console.error("Summarization failed:", error);
      alert("Failed to summarize note. Please try again.");
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleGenerateQuiz = async (note: Note) => {
    if (!note.content || isQuizGenerating) return;
    setIsQuizGenerating(true);
    try {
      const quizQuestions = await generateQuizFromContent(note.content);
      if (quizQuestions && quizQuestions.length > 0) {
        navigate('/quizzes', { state: { generatedQuiz: quizQuestions, sourceNoteId: note.id, sourceNoteTitle: note.title } });
      } else {
        alert("Could not generate a quiz from this note.");
      }
    } catch (error) {
      console.error("Quiz generation failed:", error);
      alert("Failed to generate quiz.");
    } finally {
      setIsQuizGenerating(false);
    }
  };

  // --- Data Fetching Effects ---
  useEffect(() => {
    if (currentUser) {
      getCourses().then(setCourses);
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedCourse) {
      setActiveNote(null);
      setIsEditingNote(false);
      getNotes(selectedCourse).then(setNotes);
      getFlashcards(selectedCourse).then(setFlashcards);
    } else {
      setNotes([]);
      setFlashcards([]);
      setActiveNote(null);
    }
  }, [selectedCourse]);

  // --- Handlers ---
  const handleAddCourse = async () => {
    const courseName = prompt("Enter the name of the new course:");
    if (courseName) {
      try {
        const newCourse = await addCourse(courseName);
        if (newCourse) {
          setCourses(prev => [...prev, newCourse]);
          setSelectedCourse(newCourse.id);
          showToast('Course added successfully!', 'success');
        }
      } catch (error) {
        console.error("Failed to add course:", error);
        showToast('Failed to add course. Please try again.', 'error');
      }
    }
  };

  const reloadNotes = () => {
    if (selectedCourse) {
      getNotes(selectedCourse).then(setNotes);
    }
  };
  const reloadFlashcards = () => {
    if (selectedCourse) {
      getFlashcards(selectedCourse).then(setFlashcards);
    }
  };

  const handleSelectNote = (note: Note) => {
    setActiveNote(note);
    setEditedContent(note.content || '');
    setIsEditingNote(false);
  };

  const handleDeleteNote = async (noteToDelete: Note) => {
    if (!selectedCourse || !window.confirm("Are you sure you want to delete this note?")) return;

    if (noteToDelete) {
      await deleteNote(selectedCourse, noteToDelete);
      reloadNotes();
      if (activeNote?.id === noteToDelete.id) {
        setActiveNote(null);
      }
    }
  };

  const handleSaveNoteEdit = async () => {
    if (!activeNote || !selectedCourse) return;

    try {
      const sanitizedContent = DOMPurify.sanitize(editedContent);
      await updateNoteContent(selectedCourse, activeNote.id, sanitizedContent);
      console.log("Saved note:", activeNote.id, "with content:", sanitizedContent);
      setActiveNote(prev => prev ? { ...prev, content: sanitizedContent } : null);
      setNotes(prev => prev.map(n => n.id === activeNote.id ? { ...n, content: sanitizedContent } : n));
      setIsEditingNote(false);
    } catch (error) {
      console.error("Failed to save note edit:", error);
      alert("Failed to save your changes. Please try again.");
    }
  };

  const handleGenerateFromNotes = async () => {
    if (!selectedCourse || notes.length === 0 || isGenerating || isFileGenerating || isSingleGenerating) return;

    setIsGenerating(true);
    const validNotesContent = notes
      .filter(n => n.content && n.content !== "[Text extraction pending or failed]")
      .map(n => n.content);

    if (validNotesContent.length === 0) {
      alert("No text content found in your notes to generate flashcards from.");
      setIsGenerating(false);
      return;
    }
    const content = validNotesContent.join('\n\n');

    try {
      console.log("Generating flashcards from combined notes content length:", content.length);
      const flashcardsJson = await generateFlashcards(content);
      const newFlashcards = JSON.parse(flashcardsJson).map((f: any) => ({ ...f, id: `mock_flashcard_${Date.now()}_${Math.random()}`, bucket: 1, lastReview: Date.now() }));
      await addFlashcards(selectedCourse, newFlashcards);
      reloadFlashcards();
      alert(`Successfully generated ${newFlashcards.length} flashcards from notes!`);
    } catch (error) {
      console.error("Failed to generate or parse flashcards from notes:", error);
      alert("Failed to generate flashcards from notes. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateFromFile = async (file: File | null) => {
    if (!file || !selectedCourse || isGenerating || isFileGenerating || isSingleGenerating) return;

    setIsFileGenerating(true);
    let extractedContent = '';
    try {
      const base64Data = await fileToBase64(file);
      extractedContent = await extractTextFromFile(base64Data, file.type);
      extractedContent = DOMPurify.sanitize(extractedContent);
      console.log(`Extracted ${extractedContent.length} characters from ${file.name}`);

      if (!extractedContent || extractedContent.trim().length === 0) {
        alert(`Could not extract any text from ${file.name}. Flashcard generation cancelled.`);
        setIsFileGenerating(false);
        return;
      }

      console.log(`Generating flashcards from extracted text (length: ${extractedContent.length})`);
      const flashcardsJson = await generateFlashcards(extractedContent);
      const newFlashcards = JSON.parse(flashcardsJson).map((f: any) => ({ ...f, id: `mock_flashcard_${Date.now()}_${Math.random()}`, bucket: 1, lastReview: Date.now() }));

      await addFlashcards(selectedCourse, newFlashcards);
      reloadFlashcards();
      alert(`Successfully generated ${newFlashcards.length} flashcards from the file ${file.name}!`);

    } catch (error) {
      console.error(`Failed process file ${file.name} for flashcards:`, error);
      alert(`Failed to generate flashcards from the file ${file.name}. Please try again.`);
    } finally {
      setIsFileGenerating(false);
    }
  };

  const handleGenerateSingleNoteFlashcards = async (note: Note) => {
    if (!note.content || note.content === "[Text extraction pending or failed]" || !selectedCourse || isGenerating || isFileGenerating || isSingleGenerating) {
      alert("This note doesn't have any text content to generate flashcards from.");
      return;
    }

    setIsSingleGenerating(note.id);
    try {
      const sanitizedNoteContent = DOMPurify.sanitize(note.content);
      console.log(`Generating flashcards from single note '${note.title}' (length: ${sanitizedNoteContent.length})`);
      const flashcardsJson = await generateFlashcards(sanitizedNoteContent);
      const newFlashcards = JSON.parse(flashcardsJson).map((f: any) => ({ ...f, id: `mock_flashcard_${Date.now()}_${Math.random()}`, bucket: 1, lastReview: Date.now() }));

      await addFlashcards(selectedCourse, newFlashcards);
      reloadFlashcards();
      alert(`Successfully generated ${newFlashcards.length} flashcards from the note '${note.title}'!`);
      setActiveTab('flashcards'); // Switch to flashcards tab after generation

    } catch (error) {
      console.error(`Failed to generate flashcards from note ${note.id}:`, error);
      alert(`Failed to generate flashcards from the note '${note.title}'. Please try again.`);
    } finally {
      setIsSingleGenerating(null);
    }
  };


  return (
    <div className="space-y-6 h-full flex flex-col">
      <PageHeader title="Notes & Resources" subtitle="Manage your notes, files, and flashcards for each course." />

      {/* --- Course Selector --- */}
      <div className="flex items-center gap-2">
        <BookOpen className="w-6 h-6 mr-2 text-violet-400" />
        <Select
          value={selectedCourse}
          onChange={e => setSelectedCourse(e.target.value)}
          className="w-full md:w-1/3"
        >
          <option value="">Select a Course</option>
          {Array.isArray(courses) && courses.map(course =>
            <option key={course.id} value={course.id}>{course.name}</option>
          )}
        </Select>
        <Button onClick={handleAddCourse} className="p-2.5"><PlusCircle size={16} /></Button>
      </div>

      {selectedCourse ? (
        <div className="flex-1 flex flex-col bg-slate-800/50 rounded-xl ring-1 ring-slate-700 overflow-hidden">
          {/* --- Tabs --- */}
          <div className="flex border-b border-slate-700">
            <TabButton
              icon={BookOpen}
              label="My Notes"
              isActive={activeTab === 'notes'}
              onClick={() => setActiveTab('notes')}
            />
            <TabButton
              icon={Layers}
              label={`Flashcards (${flashcards.length})`}
              isActive={activeTab === 'flashcards'}
              onClick={() => setActiveTab('flashcards')}
            />
          </div>

          {/* --- Content Area --- */}
          {activeTab === 'notes' && (
            <NotesView
              notes={notes}
              activeNote={activeNote}
              isEditingNote={isEditingNote}
              editedContent={editedContent}
              isSingleGenerating={isSingleGenerating}
              onSelectNote={handleSelectNote}
              onDeleteNote={handleDeleteNote}
              onSaveEdit={handleSaveNoteEdit}
              onEditClick={() => setIsEditingNote(true)}
              onContentChange={setEditedContent}
              onAddNoteClick={() => setIsModalOpen(true)}
              onGenerateSingleNoteFlashcards={handleGenerateSingleNoteFlashcards}
              onSummarize={handleSummarize}
              isSummarizing={isSummarizing}
              onGenerateQuiz={handleGenerateQuiz}
              isQuizGenerating={isQuizGenerating}
              onAnalyzeNote={handleAnalyzeNote}
              isAnalyzing={isAnalyzing}
            />
          )}

          {activeTab === 'flashcards' && (
            <FlashcardsView
              flashcards={flashcards}
              onGenerateFromNotes={handleGenerateFromNotes}
              onGenerateFromFile={handleGenerateFromFile}
              isGenerating={isGenerating}
              isFileGenerating={isFileGenerating}
              courseId={selectedCourse}
              onUpdateCard={async (card, correct) => {
                const newBucket = correct ? Math.min(card.bucket + 1, 4) : 1;
                await updateFlashcard(selectedCourse, card.id, { bucket: newBucket, lastReview: Date.now() });
                reloadFlashcards();
              }}
            />
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-slate-800/50 rounded-xl ring-1 ring-slate-700">
          <p className="text-slate-400">Please select a course to view your notes.</p>
        </div>
      )}

      {/* --- Add Note Modal --- */}
      <AddNoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        courseId={selectedCourse}
        onNoteAdded={reloadNotes}
      />
    </div>
  );
};

// --- TabButton Component ---
const TabButton: React.FC<{ icon: React.ElementType, label: string, isActive: boolean, onClick: () => void }> = ({ icon: Icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center gap-2 px-4 py-3 font-semibold transition-colors ${isActive
      ? 'text-violet-400 border-b-2 border-violet-400'
      : 'text-slate-400 hover:text-white'
      }`}
  >
    <Icon size={18} /> {label}
  </button>
);

const NotesView: React.FC<{
  notes: Note[];
  activeNote: Note | null;
  isEditingNote: boolean;
  editedContent: string;
  isSingleGenerating: string | null;
  onSelectNote: (note: Note) => void;
  onDeleteNote: (note: Note) => void;
  onSaveEdit: (note: Note) => void;
  onEditClick: () => void;
  onContentChange: (content: string) => void;
  onAddNoteClick: () => void;
  onGenerateSingleNoteFlashcards: (note: Note) => void;
  onSummarize: (note: Note) => void;
  isSummarizing: boolean;
  onGenerateQuiz: (note: Note) => void;
  isQuizGenerating: boolean;
  onAnalyzeNote: (note: Note) => void;
  isAnalyzing: boolean;
}> = ({
  notes,
  activeNote,
  isEditingNote,
  editedContent,
  isSingleGenerating,
  onSelectNote,
  onDeleteNote,
  onSaveEdit,
  onEditClick,
  onContentChange,
  onAddNoteClick,
  onGenerateSingleNoteFlashcards,
  onSummarize,
  isSummarizing,
  onGenerateQuiz,
  isQuizGenerating,
  onAnalyzeNote,
  isAnalyzing
}) => {
    const navigate = useNavigate();

    const handleDownloadFile = (note: Note) => {
      if ((note.type === 'file' || note.fileUrl) && note.fileUrl) {
        const link = document.createElement('a');
        link.href = note.fileUrl;
        link.download = note.fileName || (note.title.endsWith(note.fileExtension || '') ? note.title : `${note.title}.${note.fileExtension || 'txt'}`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (note.type === 'text') {
        const blob = new Blob([note.content], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${note.title}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    };

    return (
      <div className="flex flex-1 overflow-hidden">
        {/* --- Notes List --- */}
        <div className="w-1/3 border-r border-slate-700 flex flex-col">
          <div className="p-4 border-b border-slate-700">
            <Button onClick={onAddNoteClick} className="w-full">
              <PlusCircle size={16} className="mr-2" /> Add Note / File
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {notes.length === 0 && (
              <p className="text-center text-slate-400 p-4 text-sm">No notes yet.</p>
            )}
            {notes.map(note => {
              const isGeneratingThis = isSingleGenerating === note.id;
              const hasContent = note.content && note.content !== "[Text extraction pending or failed]";
              return (
                <div
                  key={note.id}
                  onClick={() => onSelectNote(note)}
                  className={`w-full text-left p-4 border-b border-slate-700 transition-colors group flex justify-between items-start cursor-pointer ${activeNote?.id === note.id ? 'bg-slate-700' : 'hover:bg-slate-700/50'}`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectNote(note)}
                >
                  <div className="flex flex-col gap-1 overflow-hidden w-full">
                    <div className="flex items-center gap-2">
                      {note.type === 'text' || !note.fileUrl ? <FileText size={14} className="mr-2 flex-shrink-0 text-slate-400" /> : <Upload size={14} className="mr-2 flex-shrink-0 text-sky-400" />}
                      <h4 className="font-semibold text-slate-100 truncate flex-1">
                        {note.title}
                      </h4>
                    </div>
                    {/* Tags in list view */}
                    {note.tags && note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 ml-6">
                        {note.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-full">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {hasContent && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 h-auto hover:bg-violet-500/30"
                        title="Generate Flashcards from this note"
                        onClick={(e) => {
                          e.stopPropagation();
                          onGenerateSingleNoteFlashcards(note);
                        }}
                        disabled={isGeneratingThis || !!isSingleGenerating}
                      >
                        {isGeneratingThis ? <Spinner size="sm" /> : <Layers size={14} className="text-violet-400" />}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 h-auto hover:bg-red-500/30"
                      title="Delete Note"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteNote(note);
                      }}
                      disabled={isGeneratingThis || !!isSingleGenerating}
                    >
                      <Trash2 size={14} className="text-red-400" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* --- Active Note Panel --- */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeNote ? (
            <div className="flex-1 flex flex-col h-full overflow-y-auto">
              {/* --- Toolbar --- */}
              <div className="flex justify-between items-center p-4 border-b border-slate-700 bg-slate-800 sticky top-0 z-10">
                <h3 className="text-lg font-semibold text-white truncate">{activeNote.title}</h3>
                <div className="flex items-center gap-2 flex-shrink-0">

                  {/* --- Analyze Button (New) --- */}
                  <Button
                    onClick={() => onAnalyzeNote(activeNote)}
                    disabled={isAnalyzing || !activeNote.content}
                    className="p-2 text-slate-400 hover:text-white transition-colors"
                    aria-label="Analyze Note"
                    title="Analyze Tags & Concepts"
                  >
                    {isAnalyzing ? <Spinner size={16} /> : <Wand2 size={16} className="text-amber-400" />}
                  </Button>

                  {/* --- Generate Quiz Button (New) --- */}
                  <Button
                    onClick={() => onGenerateQuiz(activeNote)}
                    disabled={isQuizGenerating || !activeNote.content}
                    className="p-2 text-slate-400 hover:text-white transition-colors"
                    aria-label="Generate Quiz"
                    title="Generate AI Quiz"
                  >
                    {isQuizGenerating ? <Spinner size={16} /> : <Brain size={16} className="text-rose-400" />}
                  </Button>

                  {/* --- Generate Flashcards Button --- */}
                  <Button
                    onClick={() => onGenerateSingleNoteFlashcards(activeNote)}
                    disabled={isSingleGenerating === activeNote.id || (activeNote.type === 'text' && !activeNote.content) || (!activeNote.content)}
                    className="p-2 text-slate-400 hover:text-white transition-colors"
                    aria-label="Generate Flashcards"
                    title="Generate Flashcards"
                  >
                    {isSingleGenerating === activeNote.id ? <Spinner size={16} /> : <Layers size={16} />}
                  </Button>

                  {/* --- Summarize Button --- */}
                  <Button
                    onClick={() => onSummarize(activeNote)}
                    disabled={isSummarizing || !activeNote.content}
                    className="p-2 text-slate-400 hover:text-white transition-colors"
                    aria-label="Summarize Note"
                    title="Generate Summary"
                  >
                    {isSummarizing ? <Spinner size={16} /> : <FileText size={16} />}
                  </Button>

                  {/* --- Study with AI Button --- */}
                  {activeNote.content && activeNote.content !== "[Text extraction pending or failed]" && (
                    <Button
                      onClick={() => navigate('/tutor', { state: { noteContent: activeNote.content } })}
                      className="p-2 text-slate-400 hover:text-white transition-colors"
                      aria-label="Study with AI"
                      title="Study with AI"
                    >
                      <GraduationCap size={16} className="text-indigo-400" />
                    </Button>
                  )}

                  {/* --- Download Button --- */}
                  <Button
                    onClick={() => handleDownloadFile(activeNote)}
                    className="p-2 text-slate-400 hover:text-white transition-colors"
                    aria-label="Download note"
                    title="Download"
                  >
                    <Download size={16} />
                  </Button>

                  {/* --- Edit/Save Buttons --- */}
                  {activeNote.type === 'text' && (
                    isEditingNote ? (
                      <Button onClick={() => onSaveEdit(activeNote)} className="px-3 py-1.5 text-xs">
                        <Save size={14} className="mr-1" /> Save
                      </Button>
                    ) : (
                      <Button onClick={onEditClick} className="p-2 text-slate-400 hover:text-white transition-colors" aria-label="Edit note" title="Edit">
                        <Edit size={16} />
                      </Button>
                    )
                  )}

                  {/* --- Delete Button --- */}
                  <Button onClick={() => onDeleteNote(activeNote)} className="p-2 text-red-500 hover:text-red-400 transition-colors" aria-label="Delete note" title="Delete">
                    <Trash2 size={16} />
                  </Button>

                </div>
              </div>

              {/* --- Content Display --- */}
              {isEditingNote && activeNote.type === 'text' ? (
                <Textarea
                  value={editedContent}
                  onChange={(e) => onContentChange(e.target.value)}
                  className="flex-1 w-full h-full p-4 bg-slate-800 border-none focus:ring-0 text-base"
                  placeholder="Start writing your note..."
                />
              ) : (
                <div className="p-4">
                  {/* Analysis Results Display */}
                  {(activeNote.tags?.length ? activeNote.tags.length > 0 : false || activeNote.concepts?.length ? activeNote.concepts.length > 0 : false) && (
                    <div className="mb-4 flex flex-wrap gap-2">
                      {activeNote.tags?.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded-full border border-slate-600">#{tag}</span>
                      ))}
                      {activeNote.concepts?.map(concept => (
                        <span key={concept} className="px-2 py-1 bg-indigo-900/50 text-indigo-300 text-xs rounded-full border border-indigo-700/50 flex items-center gap-1">
                          <Lightbulb size={10} /> {concept}
                        </span>
                      ))}
                    </div>
                  )}

                  {activeNote.type === 'text' && (
                    <div className="prose prose-invert max-w-none whitespace-pre-wrap">{activeNote.content || <p className="text-slate-400">This note is empty. Click 'Edit' to start writing.</p>}</div>
                  )}
                  {(activeNote.type === 'file' || activeNote.fileUrl) && activeNote.type !== 'text' && (
                    <div className="p-4 bg-slate-700/50 rounded-lg text-center">
                      <p className="text-slate-300">File Note: <span className="font-semibold text-white">{activeNote.fileName || activeNote.title}</span></p>
                      <p className="text-sm text-slate-400 mt-2">This is a file resource. You can download it or generate flashcards from its content using the buttons above.</p>
                      {activeNote.content === "[Text extraction pending or failed]" && (
                        <p className="text-amber-400 text-sm mt-2">Could not automatically extract text from this file.</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-slate-500"><ArrowLeft size={16} className="inline mr-2" /> Select a note to view or edit</p>
            </div>
          )}
        </div>
      </div>
    );
  };


// --- AddNoteModal Sub-Component ---
const AddNoteModal: React.FC<{ isOpen: boolean, onClose: () => void, courseId: string, onNoteAdded: () => void }> = ({
  isOpen, onClose, courseId, onNoteAdded
}) => {
  const noteType = 'file';
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId || !file) return;

    setIsSubmitting(true);
    try {
      await uploadNoteFile(courseId, title || file.name, file);
      onNoteAdded();
    } catch (error) {
      console.error("Failed to add note:", error);
      alert("Failed to add the note. Please try again.");
    } finally {
      setIsSubmitting(false);
      setTitle('');
      setFile(null);
      onClose();
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setTitle('');
      setFile(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Resource File">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Title (Optional - uses filename if blank)"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />

        <div className="flex items-center justify-center w-full">
          <label htmlFor="modal-file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-600 border-dashed rounded-lg cursor-pointer bg-slate-700/50 hover:bg-slate-700">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload size={24} className="text-slate-400 mb-2" />
              <p className="mb-2 text-sm text-slate-400 text-center px-2">
                {file ? file.name : <><span className="font-semibold">Click to upload</span> or drag and drop</>}</p>
              <p className="text-xs text-slate-500">PDF, TXT, MD, PPTX, Audio</p>
            </div>
            <input
              id="modal-file-upload"
              type="file"
              className="hidden"
              onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
              accept=".txt,.md,.pdf,.pptx,.mp3,.wav,.ogg,.aac"
              required
            />
          </label>
        </div>

        <Button type="submit" isLoading={isSubmitting} className="w-full" disabled={isSubmitting || !file}>
          {isSubmitting ? 'Uploading...' : 'Upload File'}
        </Button>
      </form>
    </Modal>
  );
};

// --- FlashcardsView Sub-Component ---
const FlashcardsView: React.FC<{
  flashcards: FlashcardType[],
  onGenerateFromNotes: () => void,
  onGenerateFromFile: (file: File | null) => void,
  isGenerating: boolean,
  isFileGenerating: boolean,
  courseId: string,
  onUpdateCard: (card: FlashcardType, correct: boolean) => void
}> = ({
  flashcards, onGenerateFromNotes, onGenerateFromFile, isGenerating, isFileGenerating, courseId, onUpdateCard
}) => {
    const [reviewFlashcards, setReviewFlashcards] = useState<FlashcardType[]>([]);
    const [isReviewing, setIsReviewing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        onGenerateFromFile(file);
      }
      if (event.target) {
        event.target.value = '';
      }
    };

    const startReview = () => {
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      const reviewable = flashcards.filter(f => {
        if (!f.lastReview || !f.bucket) return true;
        const daysSinceReview = (now - f.lastReview) / oneDay;
        if (f.bucket === 1) return daysSinceReview >= 1;
        if (f.bucket === 2) return daysSinceReview >= 3;
        if (f.bucket === 3) return daysSinceReview >= 7;
        if (f.bucket === 4) return daysSinceReview >= 14;
        return daysSinceReview >= 30;
      });
      setReviewFlashcards(reviewable);
      setIsReviewing(true);
    };


    return (
      <div className="p-6 overflow-y-auto">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
          accept=".txt,.md,.pdf,.pptx"
        />

        <div className="flex gap-4 mb-6">
          <Button onClick={onGenerateFromNotes} disabled={isGenerating || isFileGenerating} isLoading={isGenerating}>
            Generate from All Notes
          </Button>
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isGenerating || isFileGenerating}
            isLoading={isFileGenerating}
            variant="secondary"
          >
            <Upload size={16} className="mr-2" /> Generate from File
          </Button>
          <Button onClick={startReview} variant="outline" disabled={flashcards.length === 0 || isGenerating || isFileGenerating}>
            Review Due Cards
          </Button>
        </div>

        <h3 className="text-lg font-bold text-slate-200 mb-4">All Flashcards ({flashcards.length})</h3>
        {flashcards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {flashcards.map((card) => (
              <Flashcard key={card.id} front={card.front} back={card.back} />
            ))}
          </div>
        ) : (
          <p className="text-slate-400">No flashcards generated yet. Use the buttons above to create some!</p>
        )}

        {isReviewing && (
          <FlashcardPlayer
            flashcards={reviewFlashcards}
            onComplete={() => setIsReviewing(false)}
            onUpdateCard={onUpdateCard}
          />
        )}
      </div>
    );
  };

// --- FlashcardPlayer Sub-Component ---
const FlashcardPlayer: React.FC<{ flashcards: FlashcardType[], onComplete: () => void, onUpdateCard: (card: FlashcardType, correct: boolean) => void }> = ({ flashcards, onComplete, onUpdateCard }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleNext = (correct: boolean) => {
    onUpdateCard(flashcards[currentIndex], correct);
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      onComplete();
    }
  };


  if (flashcards.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-in fade-in-50" onClick={onComplete}>
        <div className="bg-slate-800 p-8 rounded-lg text-center" onClick={e => e.stopPropagation()}>
          <h3 className="text-xl font-bold text-white mb-4">No cards due for review!</h3>
          <p className="text-slate-400 mb-6">Good job! check back later.</p>
          <Button onClick={onComplete}>Close</Button>
        </div>
      </div>
    )
  }

  const currentCard = flashcards[currentIndex];

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" onClick={onComplete}>
      <div className="w-full max-w-2xl bg-slate-900 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-slate-700" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-slate-700 flex justify-between items-center">
          <span className="text-slate-400 text-sm">Card {currentIndex + 1} of {flashcards.length}</span>
          <button onClick={onComplete} className="text-slate-400 hover:text-white"><X size={20} /></button>
        </div>

        <div className="p-12 min-h-[300px] flex items-center justify-center cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
          <div className="text-center">
            <p className="text-sm uppercase tracking-wider text-violet-400 mb-4 font-bold">{isFlipped ? 'ANSWER' : 'QUESTION'}</p>
            <p className="text-2xl text-slate-100 font-medium leading-relaxed">
              {isFlipped ? currentCard.back : currentCard.front}
            </p>
            <p className="text-xs text-slate-500 mt-8">(Click card to flip)</p>
          </div>
        </div>

        {isFlipped && (
          <div className="p-6 bg-slate-800 border-t border-slate-700 flex gap-4 justify-center">
            <Button onClick={() => handleNext(false)} variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 w-32">
              Forgot
            </Button>
            <Button onClick={() => handleNext(true)} className="bg-green-600 hover:bg-green-500 w-32">
              Recall
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;