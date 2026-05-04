// src/components/CompositionCard.tsx

import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface CompositionCardProps {
  title: string;
  firstSectionTitle: string;
  collection_type: string;
  id: number;
}

const CompositionCard = ({
  title,
  firstSectionTitle,
  collection_type,
  id
}: CompositionCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/composition/${collection_type}/section/${id}`);
  };

  return (
    <Card
      className="bg-card text-foreground border border-border mb-6 cursor-pointer transition-all hover:bg-secondary/40 hover:shadow-md shadow-sm"
      onClick={handleClick}
    >
      <CardHeader>
        <CardTitle className="text-2xl font-serif" style={{ letterSpacing: '-0.018em', fontWeight: 580 }}>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-lg">
          {firstSectionTitle}
        </p>
      </CardContent>
    </Card>
  );
};

export default CompositionCard;