import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { useTranslations } from "@/lib/use-translations";

const ReviewDisplay = ({ review, userName, userAvatar, title }) => {
  const { t } = useTranslations();

  if (!review) {
    return null;
  }

  return (
    <Card className="shadow-sm border-0">
      <CardHeader className="bg-gray-50/50">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
          {title || (t("YourReview") || "Your Review")}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-5 w-5 ${
                star <= review.rating ? "fill-yellow-500 text-yellow-500" : "text-gray-300"
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          {t("ReviewedFor") || "Reviewed for"}: <span className="font-medium">{userName}</span>
        </p>
        <p className="text-base">{review.comment || (t("NoComment") || "No comment provided")}</p>
      </CardContent>
    </Card>
  );
};

export default ReviewDisplay;
