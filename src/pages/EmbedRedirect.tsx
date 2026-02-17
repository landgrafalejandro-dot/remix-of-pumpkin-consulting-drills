import { Navigate, useSearchParams } from "react-router-dom";

/**
 * /embed route — redirects to "/" while preserving all query params (email, deck, etc.).
 * Used when the app is embedded in an iframe via Learning Suite.
 */
const EmbedRedirect: React.FC = () => {
  const [searchParams] = useSearchParams();
  return <Navigate to={`/?${searchParams.toString()}`} replace />;
};

export default EmbedRedirect;
