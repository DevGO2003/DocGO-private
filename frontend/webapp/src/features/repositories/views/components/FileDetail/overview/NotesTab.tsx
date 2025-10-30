import { Card, CardContent } from '@shared/components';
import { StickyNote } from 'lucide-react';

interface NotesTabProps {
  fileData: any;
}

export function NotesTab({ fileData }: NotesTabProps) {
  const notes = fileData?.authorNotes || [];

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <StickyNote className="w-5 h-5 mr-2 text-indigo-600" />
          Ghi chú
        </h3>
        {notes.length > 0 ? (
          <div className="space-y-3">
            {notes.map((note: any, idx: number) => (
              <div key={idx} className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                <p className="text-sm text-gray-700">{note.content || note}</p>
                {note.author && (
                  <p className="text-xs text-gray-500 mt-2">- {note.author}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">Chưa có ghi chú nào</p>
        )}
      </CardContent>
    </Card>
  );
}
