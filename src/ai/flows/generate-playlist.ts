// src/ai/flows/generate-playlist.ts
'use server';
/**
 * @fileOverview Generates a Spotify playlist based on the mood of an Instagram profile.
 *
 * - generatePlaylist - A function that handles the playlist generation process.
 * - GeneratePlaylistInput - The input type for the generatePlaylist function.
 * - GeneratePlaylistOutput - The return type for the generatePlaylist function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {getInstagramProfileData} from '@/services/apify';
import {getSongRecommendations, savePlaylistToSpotify, Song} from '@/services/spotify';

const GeneratePlaylistInputSchema = z.object({
  instagramHandle: z.string().describe('The Instagram handle of the user.'),
});

export type GeneratePlaylistInput = z.infer<typeof GeneratePlaylistInputSchema>;

const GeneratePlaylistOutputSchema = z.object({
  playlist: z.array(
    z.object({
      name: z.string(),
      artist: z.string(),
    })
  ).describe('A list of song names and artists for the playlist.'),
  imageUrl: z.string().optional().describe('The URL of the generated image for the playlist.'),
});

export type GeneratePlaylistOutput = z.infer<typeof GeneratePlaylistOutputSchema>;

export async function generatePlaylist(input: GeneratePlaylistInput): Promise<GeneratePlaylistOutput> {
  return generatePlaylistFlow(input);
}

const moodPrompt = ai.definePrompt({
  name: 'instagramMoodPrompt',
  input: {
    schema: z.object({
      profilePictureUrl: z.string().describe('The URL of the Instagram profile picture.'),
      postUrls: z.array(z.string()).describe('A list of URLs of the profile\s posts.'),
    }),
  },
  output: {
    schema: z.object({
      mood: z.string().describe('A one-word description of the overall mood of the Instagram profile.'),
    }),
  },
  prompt: `Analyze the following Instagram profile to determine its overall mood. Consider the profile picture and the content of recent posts.

Profile Picture: {{media url=profilePictureUrl}}

Recent Posts:
{{#each postUrls}}
- {{media url=this}}
{{/each}}

Based on this information, what is the predominant mood of this Instagram profile?  Respond with only one word.`, 
});

const generatePlaylistFlow = ai.defineFlow<
  typeof GeneratePlaylistInputSchema,
  typeof GeneratePlaylistOutputSchema
>(
  {
    name: 'generatePlaylistFlow',
    inputSchema: GeneratePlaylistInputSchema,
    outputSchema: GeneratePlaylistOutputSchema,
  },
  async input => {
    const instagramData = await getInstagramProfileData(input.instagramHandle);

    const {output: moodOutput} = await moodPrompt({
      profilePictureUrl: instagramData.profilePictureUrl,
      postUrls: instagramData.postUrls,
    });

    const songs = await getSongRecommendations(moodOutput!.mood);

    await savePlaylistToSpotify(songs);

    return {
      playlist: songs,
    };
  }
);
