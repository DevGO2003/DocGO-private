import { Card, CardContent } from '@shared/components';
import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';

interface NotesTabProps {
  fileData: any;
}

export function NotesTab({ fileData }: NotesTabProps) {
  const notes = fileData?.authorNotes || [];

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <CommonIcon name="file-text" className="w-5 h-5 mr-2" style={ color: '#4f46e5' } />
          Ghi chú
        </h3>
        {notes.length > 0 ? (
          <div className="space-y-3">
            {notes.map((note: any, idx: number) => (
              <div key={idx} className="p-4 border-l-4 rounded" style={ borderColor: '#facc15' } style={ backgroundColor: '#fefce8' }>
                <p className="text-sm" style={ color: '#374151' }>{note.content || note}</p>
                {note.author && (
                  <p className="text-xs mt-2" style={ color: '#6b7280' }>- {note.author}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="py-8" style={ color: '#6b7280' }>Chưa có ghi chú nào</p>
        )}
      </CardContent>
    </Card>
  );
}
