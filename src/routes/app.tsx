import { createFileRoute } from "@tanstack/react-router";
import { OwnerLayout } from "@/components/owner-layout";

export const Route = createFileRoute("/app")({
  component: OwnerLayout,
});