"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generatePlaylist } from "@/ai/flows/generate-playlist";
import { Song } from "@/services/spotify";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function Home() {
  const [instagramHandle, setInstagramHandle] = useState("");
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGeneratePlaylist = async () => {
    setLoading(true);
    try {
      const result = await generatePlaylist({ instagramHandle });
      setPlaylist(result.playlist);
      toast({
        title: "Playlist generated!",
        description: "Your personalized playlist is ready.",
      });
    } catch (error: any) {
      console.error("Error generating playlist:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to generate playlist. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToSpotify = async () => {
    // Placeholder for saving to Spotify functionality
    toast({
      title: "Save to Spotify",
      description: "Saving to Spotify functionality will be implemented soon!",
    });
  };

  const handleGenerateShareableImage = async () => {
    // Placeholder for generating a shareable image functionality
    toast({
      title: "Generate Shareable Image",
      description: "Shareable image generation coming soon!",
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-4 sm:px-20 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-primary mb-4">
          igmoodlist
        </h1>
        <p className="text-lg text-secondary-foreground mb-6">
          Discover your personalized playlist based on your Instagram mood.
        </p>

        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Enter Instagram Handle</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Input
                type="text"
                placeholder="Instagram Handle"
                value={instagramHandle}
                onChange={(e) => setInstagramHandle(e.target.value)}
              />
            </div>
            <Button onClick={handleGeneratePlaylist} disabled={loading}>
              {loading ? "Generating..." : "Generate Playlist"}
            </Button>
          </CardContent>
        </Card>

        {playlist.length > 0 && (
          <div className="mt-8 w-full max-w-md">
            <h2 className="text-2xl font-semibold mb-4">Your Playlist</h2>
            {playlist.map((song, index) => (
              <Card key={index} className="mb-2">
                <CardContent className="flex items-center space-x-4 p-4">
                  <Avatar>
                    <AvatarImage src={`https://picsum.photos/50/50?random=${index}`} alt={song.name} />
                    <AvatarFallback>{song.artist.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{song.name}</p>
                    <p className="text-sm text-muted-foreground">{song.artist}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
            <div className="flex justify-between mt-4">
              <Button variant="secondary" onClick={handleSaveToSpotify}>
                Save to Spotify
              </Button>
              <Button variant="secondary" onClick={handleGenerateShareableImage}>
                Generate Shareable Image
              </Button>
            </div>
          </div>
        )}

        {loading && playlist.length === 0 && (
          <div className="mt-8 w-full max-w-md">
            <h2 className="text-2xl font-semibold mb-4">Analyzing Instagram Profile...</h2>
            <div className="flex flex-col gap-2">
              {[...Array(3)].map((_, index) => (
                <Card key={index} className="mb-2 animate-pulse">
                  <CardContent className="flex items-center space-x-4 p-4">
                    <Avatar>
                      <AvatarImage src={`https://picsum.photos/50/50?random=${index}`} alt="Analyzing" />
                      <AvatarFallback>Analyzing...</AvatarFallback>
                    </Avatar>
                    <div>
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[150px] mt-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
              <p className="text-sm text-muted-foreground">
                This may take a moment...
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
