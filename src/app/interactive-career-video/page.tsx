import type { Metadata } from "next";
import { InteractiveCareerVideoFrame } from "./interactive-career-video-frame";

export const metadata: Metadata = {
  title: "Khám phá 5 ngành nghề · Video tương tác · LEXA AI",
  description:
    "Video tương tác giới thiệu tiếp viên hàng không, kỹ sư phần mềm, UI Designer, pháp lý và giáo viên.",
};

export default function InteractiveCareerVideoPage() {
  return <InteractiveCareerVideoFrame />;
}
