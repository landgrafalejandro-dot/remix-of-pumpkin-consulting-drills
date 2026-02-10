import React, { useCallback, useRef, useState } from "react";
import { Upload, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { parseCSV, ValidationError, validateDrillTaskRow, DRILL_TASKS_CSV_TEMPLATE } from "@/lib/csvParser";

interface CsvUploadProps {
  onImport: (rows: Record<string, string>[]) => void;
  importing: boolean;
}

const CsvUpload: React.FC<CsvUploadProps> = ({ onImport, importing }) => {
  const [parsedRows, setParsedRows] = useState<Record<string, string>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const processFile = useCallback((file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const { headers: h, rows } = parseCSV(text);
      setHeaders(h);
      setParsedRows(rows);

      const allErrors: ValidationError[] = [];
      rows.forEach((row, i) => {
        allErrors.push(...validateDrillTaskRow(row, i + 2));
      });
      setErrors(allErrors);
    };
    reader.readAsText(file, "UTF-8");
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const downloadTemplate = () => {
    const blob = new Blob(["\ufeff" + DRILL_TASKS_CSV_TEMPLATE], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "drill_tasks_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const validRows = parsedRows.filter((_, i) => !errors.some((e) => e.row === i + 2));

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">CSV Import</CardTitle>
        <Button variant="outline" size="sm" onClick={downloadTemplate}>
          <Download className="mr-2 h-4 w-4" /> Template
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 transition-colors ${
            dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {fileName ? <span className="text-foreground font-medium">{fileName}</span> : "CSV hierher ziehen oder klicken"}
          </p>
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) processFile(f);
          }} />
        </div>

        {parsedRows.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>{parsedRows.length} Zeilen geladen, {validRows.length} valide</span>
            </div>

            {errors.length > 0 && (
              <div className="max-h-40 overflow-auto rounded-lg bg-destructive/10 p-3 text-sm">
                <p className="mb-1 font-semibold text-destructive">{errors.length} Fehler:</p>
                {errors.slice(0, 20).map((err, i) => (
                  <p key={i} className="text-destructive/80">Zeile {err.row}: {err.field} – {err.message}</p>
                ))}
                {errors.length > 20 && <p className="text-destructive/60">… und {errors.length - 20} weitere</p>}
              </div>
            )}

            <div className="max-h-60 overflow-auto rounded-lg border border-border">
              <table className="w-full text-xs">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    {headers.map((h) => (
                      <th key={h} className="px-2 py-1 text-left font-medium text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parsedRows.slice(0, 10).map((row, i) => (
                    <tr key={i} className="border-t border-border">
                      {headers.map((h) => (
                        <td key={h} className="max-w-[200px] truncate px-2 py-1">{row[h]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Button
              onClick={() => onImport(validRows)}
              disabled={validRows.length === 0 || importing}
              className="w-full"
            >
              {importing ? "Importiere…" : `Import starten (${validRows.length} Aufgaben)`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CsvUpload;
