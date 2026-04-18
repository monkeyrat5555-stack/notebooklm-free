class CloudIngestion {
  constructor() {
    this.maxFileSize = 10 * 1024 * 1024 // 10MB
    this.allowedTypes = ['application/pdf']
  }

  // Cloud-based PDF processing using serverless functions
  async processPDF(fileBuffer, filename) {
    try {
      // Validate file
      this.validateFile(fileBuffer, filename)

      // Use cloud-based PDF parsing (no local processing)
      const textContent = await this.extractTextFromPDF(fileBuffer)
      
      // Create document metadata
      const document = {
        id: this.generateId(),
        filename: filename,
        type: 'pdf',
        size: fileBuffer.length,
        content: textContent,
        pages: this.estimatePages(textContent),
        processedAt: new Date().toISOString(),
        chunks: []
      }

      // Create chunks for embedding
      document.chunks = this.createChunks(textContent, document.id)

      console.log(`✅ PDF processed: ${filename} (${document.pages} pages, ${document.chunks.length} chunks)`)
      return document

    } catch (error) {
      console.error('❌ PDF processing failed:', error)
      throw new Error(`Failed to process PDF: ${error.message}`)
    }
  }

  // Browser-based PDF extraction using PDF.js (client-side)
  async extractTextFromPDFBrowser(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = async (e) => {
        try {
          const typedarray = new Uint8Array(e.target.result)
          
          // Load PDF.js from CDN (no local dependencies)
          const pdfjsLib = await this.loadPDFJS()
          
          const pdf = await pdfjsLib.getDocument(typedarray).promise
          let fullText = ''
          
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i)
            const textContent = await page.getTextContent()
            const pageText = textContent.items
              .map(item => item.str)
              .join(' ')
            fullText += `\n--- Page ${i} ---\n${pageText}\n`
          }
          
          resolve(fullText)
        } catch (error) {
          reject(error)
        }
      }
      
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsArrayBuffer(file)
    })
  }

  // Server-side PDF extraction using free cloud APIs
  async extractTextFromPDF(fileBuffer) {
    try {
      // Try multiple free PDF extraction services
      const services = [
        () => this.extractWithPDFCo(fileBuffer),
        () => this.extractWithILovePDF(fileBuffer),
        () => this.extractWithSimpleParser(fileBuffer)
      ]

      for (const service of services) {
        try {
          const result = await service()
          if (result && result.length > 100) {
            return result
          }
        } catch (error) {
          console.log('PDF service failed, trying next...')
          continue
        }
      }

      throw new Error('All PDF extraction services failed')

    } catch (error) {
      // Fallback to basic text extraction
      return this.extractWithSimpleParser(fileBuffer)
    }
  }

  // Free PDF.co API (limited but functional)
  async extractWithPDFCo(fileBuffer) {
    const response = await fetch('https://api.pdf.co/v1/pdf/convert/to/text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'x-api-key': process.env.PDF_CO_API_KEY || 'demo'
      },
      body: fileBuffer
    })

    if (!response.ok) {
      throw new Error('PDF.co API error')
    }

    const result = await response.json()
    return result.body || result.text
  }

  // iLovePDF free API
  async extractWithILovePDF(fileBuffer) {
    const formData = new FormData()
    formData.append('file', new Blob([fileBuffer]), 'document.pdf')
    formData.append('tool', 'text')
    formData.append('v', '1.0')

    const response = await fetch('https://api.ilovepdf.com/v1/start', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error('iLovePDF API error')
    }

    const result = await response.json()
    return result.text || ''
  }

  // Simple fallback parser
  async extractWithSimpleParser(fileBuffer) {
    // Basic text extraction from PDF binary
    const text = fileBuffer.toString('utf8', 0, Math.min(fileBuffer.length, 1000000))
    
    // Extract readable text patterns
    const readableText = text
      .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
      .replace(/\s+/g, ' ')
      .substring(0, 50000) // Limit to prevent memory issues

    return readableText || 'Text extraction failed. Please try another PDF.'
  }

  // YouTube transcript fetching using free APIs
  async fetchYouTubeTranscript(videoUrl) {
    try {
      const videoId = this.extractVideoId(videoUrl)
      if (!videoId) {
        throw new Error('Invalid YouTube URL')
      }

      // Try multiple free transcript services
      const services = [
        () => this.fetchWithYouTubeAPI(videoId),
        () => this.fetchWithYoutubetranscriptAPI(videoId),
        () => this.fetchWithRapidAPI(videoId)
      ]

      for (const service of services) {
        try {
          const transcript = await service()
          if (transcript && transcript.length > 100) {
            return {
              videoId: videoId,
              url: videoUrl,
              transcript: transcript,
              title: await this.fetchVideoTitle(videoId)
            }
          }
        } catch (error) {
          console.log('Transcript service failed, trying next...')
          continue
        }
      }

      throw new Error('All transcript services failed')

    } catch (error) {
      console.error('❌ YouTube transcript failed:', error)
      throw new Error(`Failed to fetch transcript: ${error.message}`)
    }
  }

  // YouTube Data API (free tier)
  async fetchWithYouTubeAPI(videoId) {
    const apiKey = process.env.YOUTUBE_API_KEY
    if (!apiKey) {
      throw new Error('YouTube API key not configured')
    }

    const response = await fetch(`https://www.googleapis.com/youtube/v3/captions?videoId=${videoId}&key=${apiKey}&part=snippet`)
    
    if (!response.ok) {
      throw new Error('YouTube API error')
    }

    const data = await response.json()
    const captionTrack = data.items?.[0]
    
    if (!captionTrack) {
      throw new Error('No captions available')
    }

    // Fetch caption content
    const captionResponse = await fetch(`https://www.googleapis.com/youtube/v3/captions/${captionTrack.id}?key=${apiKey}&tfmt=srt`)
    const captionText = await captionResponse.text()
    
    return this.parseSRTToText(captionText)
  }

  // youtubetranscript.com free API
  async fetchWithYoutubetranscriptAPI(videoId) {
    const response = await fetch(`https://youtubetranscript.com/api/transcript?video_id=${videoId}`)
    
    if (!response.ok) {
      throw new Error('Transcript API error')
    }

    const data = await response.json()
    return data.transcript || ''
  }

  // RapidAPI YouTube transcript
  async fetchWithRapidAPI(videoId) {
    const response = await fetch(`https://youtube-transcriptor.p.rapidapi.com/transcript?video_id=${videoId}`, {
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || 'demo',
        'X-RapidAPI-Host': 'youtube-transcriptor.p.rapidapi.com'
      }
    })

    if (!response.ok) {
      throw new Error('RapidAPI error')
    }

    const data = await response.json()
    return data.transcript || ''
  }

  // Helper methods
  validateFile(buffer, filename) {
    if (buffer.length > this.maxFileSize) {
      throw new Error('File too large (max 10MB)')
    }

    const fileSignature = buffer.toString('hex', 0, 4)
    const pdfSignature = '25504446' // %PDF
    
    if (fileSignature !== pdfSignature) {
      throw new Error('Invalid PDF file')
    }
  }

  estimatePages(text) {
    const pageBreaks = (text.match(/--- Page \d+ ---/g) || []).length
    return pageBreaks || Math.ceil(text.length / 2000) // Estimate if no page markers
  }

  createChunks(content, documentId, chunkSize = 1000) {
    const chunks = []
    const sentences = content.split(/[.!?]+/)
    let currentChunk = ''
    let chunkIndex = 0

    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length > chunkSize && currentChunk) {
        chunks.push({
          id: `${documentId}_chunk_${chunkIndex++}`,
          content: currentChunk.trim(),
          documentId: documentId,
          chunkIndex: chunkIndex
        })
        currentChunk = sentence
      } else {
        currentChunk += sentence + '. '
      }
    }

    if (currentChunk) {
      chunks.push({
        id: `${documentId}_chunk_${chunkIndex}`,
        content: currentChunk.trim(),
        documentId: documentId,
        chunkIndex: chunkIndex
      })
    }

    return chunks
  }

  extractVideoId(url) {
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

  async fetchVideoTitle(videoId) {
    try {
      const response = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`)
      const data = await response.json()
      return data.title || `YouTube Video ${videoId}`
    } catch (error) {
      return `YouTube Video ${videoId}`
    }
  }

  parseSRTToText(srtText) {
    return srtText
      .replace(/\d+\n\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}\n/g, '')
      .replace(/\n\n/g, ' ')
      .replace(/\n/g, ' ')
      .trim()
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  async loadPDFJS() {
    // Load PDF.js from CDN (no local dependencies)
    if (typeof window !== 'undefined' && window.pdfjsLib) {
      return window.pdfjsLib
    }

    // For server-side, we'd use a different approach
    throw new Error('PDF.js requires browser environment')
  }
}

module.exports = CloudIngestion
