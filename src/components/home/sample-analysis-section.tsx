"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "./section-heading";
import { hasCompletedAssessment } from "@/lib/user-profile";

export function SampleAnalysisSection() {
  const [hasOwn, setHasOwn] = React.useState(false);

  React.useEffect(() => {
    const refresh = () => setHasOwn(hasCompletedAssessment());
    refresh();
    window.addEventListener("lexa-profile-updated", refresh);
    return () => window.removeEventListener("lexa-profile-updated", refresh);
  }, []);

  if (hasOwn) {
    return null;
  }

  return (
    <section>
      <SectionHeading
        eyebrow="Cách LEXA phân tích"
        title="Câu trả lời → Phân tích → Kết quả"
        description="LEXA không hiển thị gợi ý nghề trước khi có dữ liệu từ bạn."
      />
      <Card className="mt-8 border-dashed">
        <CardContent className="p-8 text-center">
          <ButtonLink href="/test" className="mt-2 justify-center">
            Bắt đầu đánh giá để xem kết quả
          </ButtonLink>
        </CardContent>
      </Card>
    </section>
  );
}
