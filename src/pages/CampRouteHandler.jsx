import { useParams, Navigate } from "react-router-dom";
import useCampPage from "../hooks/useCampPage";
import DenemeKampiPage from "./DenemeKampiPage";
import { lazy, Suspense } from "react";

const NotFound = lazy(() => import("./notFound.jsx"));

export default function CampRouteHandler() {
  const { campSlug } = useParams();
  const { content, loading } = useCampPage();

  if (loading) return <div className="loading-spinner"><span></span>Yükleniyor...</div>;
  if (!content || content.slug !== campSlug) return <NotFound />;
  return <DenemeKampiPage />;
}
