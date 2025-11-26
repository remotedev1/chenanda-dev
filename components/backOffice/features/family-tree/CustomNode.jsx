import { Handle, Position } from "@xyflow/react";
import { useState, useEffect } from "react";

export function CustomNode({ id, data }) {
  const [label, setLabel] = useState(data.label);
  const [role, setRole] = useState(data.role);

  // Sync with parent state
  useEffect(() => {
    if (data.onUpdate) {
      data.onUpdate(id, { label, role });
    }
  }, [label, role]);

  return (
    <div className="p-3 bg-white rounded shadow border w-44 text-center">
      <input
        className="w-full border p-1 mb-1 text-sm rounded"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
      />
      <input
        className="w-full border p-1 text-xs rounded"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      />

      {/* Connection handles */}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
