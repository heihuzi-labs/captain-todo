import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Button } from './ui/button';
import { Download, FileJson, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ExportMenuProps {
  onExportJSON: () => string;
  onExportCSV: () => string;
  boardTitle: string;
}

export function ExportMenu({ onExportJSON, onExportCSV, boardTitle }: ExportMenuProps) {
  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    try {
      const jsonContent = onExportJSON();
      const filename = `${boardTitle}-${new Date().toISOString().split('T')[0]}.json`;
      downloadFile(jsonContent, filename, 'application/json');
      toast.success('JSON 文件导出成功');
    } catch (error) {
      toast.error('导出失败，请重试');
      console.error('Export JSON error:', error);
    }
  };

  const handleExportCSV = () => {
    try {
      const csvContent = onExportCSV();
      const filename = `${boardTitle}-cards-${new Date().toISOString().split('T')[0]}.csv`;
      downloadFile(csvContent, filename, 'text/csv;charset=utf-8');
      toast.success('CSV 文件导出成功');
    } catch (error) {
      toast.error('导出失败，请重试');
      console.error('Export CSV error:', error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          导出
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportJSON} className="gap-2">
          <FileJson className="w-4 h-4" />
          导出为 JSON
          <span className="text-xs text-muted-foreground ml-auto">完整数据</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportCSV} className="gap-2">
          <FileSpreadsheet className="w-4 h-4" />
          导出为 CSV
          <span className="text-xs text-muted-foreground ml-auto">卡片列表</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}