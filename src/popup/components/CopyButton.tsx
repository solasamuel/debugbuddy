import { useState } from "react";
import { copyToClipboard } from "@/utils/clipboard";

interface CopyButtonProps {
  text: string;
  label: string;
  markdown?: boolean;
}

export default function CopyButton({ text, label, markdown }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const content = markdown ? `\`\`\`\n${text}\n\`\`\`` : text;
    await copyToClipboard(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button className="copy-button" onClick={handleCopy} aria-label={label}>
      {copied ? "Copied!" : label}
    </button>
  );
}
