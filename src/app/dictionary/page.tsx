import { redirect } from "next/navigation";

export default function DictionaryPage() {
  redirect("/translate?tab=dictionary");
}

