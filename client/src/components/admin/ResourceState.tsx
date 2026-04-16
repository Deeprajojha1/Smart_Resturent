import { ClipLoader } from "react-spinners";

type ResourceStateProps = {
  loading: boolean;
  error: string | null;
  empty: boolean;
  emptyMessage?: string;
};

const ResourceState = ({
  loading,
  error,
  empty,
  emptyMessage = "No records found.",
}: ResourceStateProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <ClipLoader color="#6B5C46" loading size={20} />
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-[#9B3F2C]">{error}</p>;
  }

  if (empty) {
    return <p className="text-sm text-[#8A7A62]">{emptyMessage}</p>;
  }

  return null;
};

export default ResourceState;
