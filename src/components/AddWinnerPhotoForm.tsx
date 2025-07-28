import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Upload } from "lucide-react";
import { useSparkData } from "@/hooks/useSparkData";
import { useToast } from "@/hooks/use-toast";
const AddWinnerPhotoForm: React.FC = () => {
  const {
    winners,
    addWinnerPhoto
  } = useSparkData();
  const {
    toast
  } = useToast();
  const [selectedWinner, setSelectedWinner] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWinner || !imageUrl) {
      toast({
        title: "Missing Fields",
        description: "Please select a winner and provide an image URL.",
        variant: "destructive"
      });
      return;
    }
    addWinnerPhoto(selectedWinner, imageUrl);
    const winner = winners.find(w => w.id === selectedWinner);
    toast({
      title: "Photo Added Successfully",
      description: `Photo added for ${winner?.name}!`
    });

    // Reset form
    setSelectedWinner('');
    setImageUrl('');
  };
  return;
};
export default AddWinnerPhotoForm;