import { ArrowLeft } from "lucide-react";

export const CustomHeader = ({ handleBack, title }: { handleBack: () => void, title: string }) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white">
      <div className="max-w-[430px] mx-auto">
        <div className="flex items-center h-11 px-3.5">
          <button
            className="flex items-center justify-center"
            onClick={handleBack}
          >
            <ArrowLeft size={24} className="text-foreground" />
          </button>
        </div>

        {/* Title */}
        <div className="px-4 py-4">
          <div className="text-title-2 text-gray-800">{title}</div>
        </div>
      </div>
    </div>
  );
};
