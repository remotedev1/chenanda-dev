import { Button } from "@/components/ui/button";

export function Sidebar({ onAddPerson, onExport, onReset, onSave }) {
  return (
    <div className="w-64 bg-gray-100 p-4 space-y-2">
      <Button onClick={onAddPerson}>Add Person</Button>
      <Button onClick={onExport}>Export JSON</Button>
      <Button onClick={onReset}>Reset</Button>
      <Button onClick={onSave}>Save to DB</Button> {/* 👈 new button */}
    </div>
  );
}
