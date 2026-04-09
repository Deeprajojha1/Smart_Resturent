type SectionShellProps = {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
};

const SectionShell = ({ title, subtitle, children }: SectionShellProps) => {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-[#8A7A62]">
          {subtitle ?? "Admin Workspace"}
        </p>
        <h3 className="text-2xl font-semibold text-[#2A241B]">{title}</h3>
      </div>
      {children}
    </div>
  );
};

export default SectionShell;
