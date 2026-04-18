const express = require('express')
const router = express.Router()

// Extract video ID from YouTube URL
function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

// Get video metadata
async function getVideoMetadata(videoId) {
  try {
    // For now, return mock data
    // In production, you would use YouTube API or a scraping service
    return {
      title: `YouTube Video ${videoId}`,
      description: 'Video description would be here',
      duration: '10:30',
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    }
  } catch (error) {
    console.error('Error getting video metadata:', error)
    throw new Error('Failed to get video metadata')
  }
}

// Transcribe video (mock implementation)
async function transcribeVideo(videoId) {
  try {
    // TODO: Implement actual transcription using:
    // 1. YouTube API for captions if available
    // 2. Free speech-to-text services
    // 3. OpenAI Whisper API (if free tier available)
    
    // Mock transcript for now
    return `This is a mock transcript for YouTube video ${videoId}. 
    
In the actual implementation, this would contain the full transcription of the video content, which would then be processed and embedded for search and analysis.

The transcript would include:
- All spoken content with timestamps
- Speaker identification if available
- Proper formatting for easy parsing
- Automatic chapter detection

This transcript would then be used to create embeddings and allow users to ask questions about the video content.`
  } catch (error) {
    console.error('Error transcribing video:', error)
    throw new Error('Failed to transcribe video')
  }
}

// Validate YouTube URL
router.post('/validate', async (req, res) => {
  try {
    const { url } = req.body

    if (!url) {
      return res.status(400).json({ error: 'URL is required' })
    }

    const videoId = extractVideoId(url)
    if (!videoId) {
      return res.status(400).json({ error: 'Invalid YouTube URL' })
    }

    // Get video metadata
    const metadata = await getVideoMetadata(videoId)

    res.json({
      valid: true,
      videoId: videoId,
      metadata: metadata
    })

  } catch (error) {
    console.error('Error validating YouTube URL:', error)
    res.status(500).json({ error: 'Failed to validate YouTube URL' })
  }
})

// Process YouTube video
router.post('/process', async (req, res) => {
  try {
    const { url } = req.body

    if (!url) {
      return res.status(400).json({ error: 'URL is required' })
    }

    const videoId = extractVideoId(url)
    if (!videoId) {
      return res.status(400).json({ error: 'Invalid YouTube URL' })
    }

    // Get video metadata
    const metadata = await getVideoMetadata(videoId)

    // Transcribe video
    const transcript = await transcribeVideo(videoId)

    res.json({
      success: true,
      video: {
        id: videoId,
        url: url,
        title: metadata.title,
        description: metadata.description,
        duration: metadata.duration,
        transcript: transcript
      }
    })

  } catch (error) {
    console.error('Error processing YouTube video:', error)
    res.status(500).json({ error: 'Failed to process YouTube video' })
  }
})

// Get transcript only
router.get('/transcript/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params

    if (!videoId) {
      return res.status(400).json({ error: 'Video ID is required' })
    }

    const transcript = await transcribeVideo(videoId)

    res.json({
      videoId: videoId,
      transcript: transcript
    })

  } catch (error) {
    console.error('Error getting transcript:', error)
    res.status(500).json({ error: 'Failed to get transcript' })
  }
})

module.exports = router
