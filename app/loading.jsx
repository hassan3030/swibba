import LoadingSpinner from '@/components/loading-spinner'

const LoadingPage = () => {
  return (
   <>
       <LoadingSpinner branded  fullPage={true} size="md"  />
   </> // <LoadingSpinner fullPage={true} size="md" text="Loading..." />
  );
};

export default LoadingPage;
