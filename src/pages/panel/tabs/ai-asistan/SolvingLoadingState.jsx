export default function SolvingLoadingState() {
  return (
    <div className="bg-white rounded-2xl border border-[#f1f5f9] p-10 text-center">
      <div className="w-10 h-10 border-4 border-brand-light border-t-brand rounded-full animate-spin mx-auto mb-4" />
      <p className="font-fredoka font-bold text-page-navy text-base">Sorunu inceliyorum...</p>
      <p className="font-nunito text-xs text-[#94a3b8] mt-1">Bu birkaç saniye sürebilir.</p>
    </div>
  );
}
