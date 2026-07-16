export default function LoadingPill() {
  return (
    <div className={"min-h-screen flex justify-center items-center bg-gray-900"}>
      <div className={"bg-purple-200 p-5 rounded-full flex space-x-3"}>
        <div className={"bg-gray-800 w-5 h-5 rounded-full animate-bounce"}></div>
        <div className={"bg-gray-800 w-5 h-5 rounded-full animate-bounce"}></div>
        <div className={"bg-gray-800 w-5 h-5 rounded-full animate-bounce"}></div>
      </div>
    </div>
  );
}
