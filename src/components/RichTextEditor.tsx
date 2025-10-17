'use client';

import { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { 
  Bold, 
  Italic, 
  Underline, 
  Link, 
  List, 
  ListOrdered,
  Quote,
  Type,
  Code,
  Eye,
  EyeOff,
  Scissors,
  Copy,
  Undo,
  Redo,
  Image,
  Table,
  Minus,
  Maximize,
  HelpCircle,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({ value, onChange, placeholder, className = '' }: RichTextEditorProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sauvegarder dans l'historique
  const saveToHistory = (content: string) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(content);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Annuler
  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      onChange(history[newIndex]);
    }
  };

  // Refaire
  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      onChange(history[newIndex]);
    }
  };

  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    const beforeText = value.substring(0, start);
    const afterText = value.substring(end);
    
    const newText = beforeText + text.replace('SELECTED_TEXT', selectedText) + afterText;
    onChange(newText);
    saveToHistory(newText);
    
    // Restaurer la position du curseur
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  const formatText = (tag: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    if (selectedText) {
      const formattedText = `<${tag}>${selectedText}</${tag}>`;
      insertAtCursor(formattedText);
    } else {
      insertAtCursor(`<${tag}>SELECTED_TEXT</${tag}>`);
    }
  };

  const insertLink = () => {
    const url = prompt('Entrez l\'URL du lien:');
    if (url) {
      const text = prompt('Entrez le texte du lien:', url);
      if (text) {
        insertAtCursor(`<a href="${url}">${text}</a>`);
      }
    }
  };

  const insertList = (ordered = false) => {
    const tag = ordered ? 'ol' : 'ul';
    insertAtCursor(`<${tag}>\n<li>Élément 1</li>\n<li>Élément 2</li>\n</${tag}>`);
  };

  const insertParagraph = () => {
    insertAtCursor('<p>Nouveau paragraphe</p>');
  };

  const insertQuote = () => {
    insertAtCursor('<blockquote>Citation</blockquote>');
  };

  const insertCode = () => {
    insertAtCursor('<code>Code</code>');
  };

  const insertImage = () => {
    const url = prompt('Entrez l\'URL de l\'image:');
    if (url) {
      const alt = prompt('Entrez le texte alternatif:', '');
      insertAtCursor(`<img src="${url}" alt="${alt}" style="max-width: 100%; height: auto;" />`);
    }
  };

  const insertTable = () => {
    insertAtCursor(`<table border="1" style="border-collapse: collapse; width: 100%;">
  <tr>
    <td>Cellule 1</td>
    <td>Cellule 2</td>
  </tr>
  <tr>
    <td>Cellule 3</td>
    <td>Cellule 4</td>
  </tr>
</table>`);
  };

  const insertHorizontalRule = () => {
    insertAtCursor('<hr />');
  };

  const linkify = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, '<a href="$1" class="text-blue-600 hover:underline">$1</a>');
  };

  // Initialiser l'historique
  useEffect(() => {
    if (value && history.length === 0) {
      saveToHistory(value);
    }
  }, [value]);

  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden ${className}`}>
      {/* Barre d'outils - Première ligne */}
      <div className="bg-gray-100 border-b border-gray-300 p-1">
        <div className="flex flex-wrap gap-1">
          {/* Outils de base */}
          <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-gray-200"
              title="Couper"
            >
              <Scissors className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-gray-200"
              title="Copier"
            >
              <Copy className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-gray-200"
              title="Coller"
            >
              <span className="text-xs font-bold">T</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-gray-200"
              title="Coller depuis Word"
            >
              <span className="text-xs font-bold">W</span>
            </Button>
          </div>

          {/* Annuler/Refaire */}
          <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={undo}
              disabled={historyIndex <= 0}
              className="h-7 w-7 p-0 hover:bg-gray-200 disabled:opacity-50"
              title="Annuler"
            >
              <Undo className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="h-7 w-7 p-0 hover:bg-gray-200 disabled:opacity-50"
              title="Refaire"
            >
              <Redo className="h-3 w-3" />
            </Button>
          </div>

          {/* Vérification orthographique */}
          <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-gray-200"
              title="Vérification orthographique"
            >
              <span className="text-xs font-bold">ABC</span>
            </Button>
          </div>

          {/* Liens */}
          <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={insertLink}
              className="h-7 w-7 p-0 hover:bg-gray-200"
              title="Insérer un lien"
            >
              <Link className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-gray-200"
              title="Supprimer le lien"
            >
              <span className="text-xs">🔗</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-gray-200"
              title="Ancre"
            >
              <span className="text-xs">⚓</span>
            </Button>
          </div>

          {/* Images et tableaux */}
          <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={insertImage}
              className="h-7 w-7 p-0 hover:bg-gray-200"
              title="Insérer une image"
            >
              <Image className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={insertTable}
              className="h-7 w-7 p-0 hover:bg-gray-200"
              title="Insérer un tableau"
            >
              <Table className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={insertHorizontalRule}
              className="h-7 w-7 p-0 hover:bg-gray-200"
              title="Ligne horizontale"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-gray-200"
              title="Caractères spéciaux"
            >
              <span className="text-xs">Ω</span>
            </Button>
          </div>

          {/* Plein écran et source */}
          <div className="flex gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-gray-200"
              title="Plein écran"
            >
              <Maximize className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="h-7 w-7 p-0 hover:bg-gray-200"
              title="Code source"
            >
              <span className="text-xs font-bold">Source</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Barre d'outils - Deuxième ligne */}
      <div className="bg-gray-100 border-b border-gray-300 p-1">
        <div className="flex flex-wrap gap-1">
          {/* Formatage de texte */}
          <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => formatText('strong')}
              className="h-7 w-7 p-0 hover:bg-gray-200"
              title="Gras"
            >
              <span className="text-xs font-bold">B</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => formatText('em')}
              className="h-7 w-7 p-0 hover:bg-gray-200"
              title="Italique"
            >
              <span className="text-xs italic">I</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => formatText('u')}
              className="h-7 w-7 p-0 hover:bg-gray-200"
              title="Souligné"
            >
              <span className="text-xs underline">S</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-gray-200"
              title="Barré"
            >
              <span className="text-xs line-through">S</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-gray-200"
              title="Indice"
            >
              <span className="text-xs">X<sub>2</sub></span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-gray-200"
              title="Exposant"
            >
              <span className="text-xs">X<sup>2</sup></span>
            </Button>
          </div>

          {/* Listes */}
          <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertList(true)}
              className="h-7 w-7 p-0 hover:bg-gray-200"
              title="Liste numérotée"
            >
              <ListOrdered className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertList(false)}
              className="h-7 w-7 p-0 hover:bg-gray-200"
              title="Liste à puces"
            >
              <List className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-gray-200"
              title="Diminuer l'indentation"
            >
              <span className="text-xs">←</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-gray-200"
              title="Augmenter l'indentation"
            >
              <span className="text-xs">→</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={insertQuote}
              className="h-7 w-7 p-0 hover:bg-gray-200"
              title="Citation"
            >
              <Quote className="h-3 w-3" />
            </Button>
          </div>

          {/* Styles */}
          <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
            <select className="h-7 px-2 text-xs border border-gray-300 rounded bg-white">
              <option>Styles</option>
              <option>Normal</option>
              <option>En-tête 1</option>
              <option>En-tête 2</option>
            </select>
            <select className="h-7 px-2 text-xs border border-gray-300 rounded bg-white">
              <option>Normal</option>
              <option>Times New Roman</option>
              <option>Arial</option>
              <option>Verdana</option>
            </select>
          </div>

          {/* Aide */}
          <div className="flex gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-gray-200"
              title="Aide"
            >
              <HelpCircle className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Zone d'édition */}
      <div className="bg-white">
        {showPreview ? (
          <div
            className="min-h-[200px] p-4 prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ 
              __html: value ? linkify(value) : `<p class="text-gray-400">${placeholder || 'Aucun contenu'}</p>` 
            }}
          />
        ) : (
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              saveToHistory(e.target.value);
            }}
            placeholder={placeholder}
            className="min-h-[200px] border-0 focus-visible:ring-0 rounded-none font-mono text-sm resize-none"
            style={{ fontFamily: 'Consolas, Monaco, "Courier New", monospace' }}
          />
        )}
      </div>

      {/* Barre de statut */}
      <div className="bg-gray-50 border-t border-gray-300 px-3 py-1 text-xs text-gray-600 flex justify-between items-center">
        <span>body p</span>
        <div className="flex items-center gap-2">
          <span>{value.length} caractères</span>
          <div className="w-3 h-3 bg-gray-400 cursor-se-resize"></div>
        </div>
      </div>
    </div>
  );
}