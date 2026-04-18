class CitationSystem {
  constructor() {
    this.citationFormats = {
      pdf: (doc, pageNumber) => ({
        type: 'pdf',
        title: doc.title,
        filename: doc.filename,
        page: pageNumber || 'N/A',
        url: null,
        timestamp: null,
        format: `[${doc.title}, p. ${pageNumber || 'N/A'}]`
      }),
      youtube: (doc, timestamp) => ({
        type: 'youtube',
        title: doc.title,
        filename: null,
        page: null,
        url: doc.url,
        timestamp: timestamp || '0:00',
        format: `[${doc.title}, ${timestamp || '0:00'}]`
      })
    }
  }

  // Extract citations from text and validate against sources
  extractAndValidateCitations(text, sources) {
    const citationRegex = /\[(\d+)\]/g
    const citations = []
    const usedSources = new Set()
    let match

    while ((match = citationRegex.exec(text)) !== null) {
      const citationNum = parseInt(match[1])
      if (sources[citationNum - 1]) {
        const source = sources[citationNum - 1]
        const citation = this.formatCitation(source)
        citations.push({
          id: citationNum,
          ...citation,
          position: match.index,
          text: source.text || source.content?.substring(0, 200) + '...'
        })
        usedSources.add(source.id || citationNum)
      }
    }

    return {
      citations: citations,
      usedSources: Array.from(usedSources),
      missingCitations: this.findMissingCitations(text, citations)
    }
  }

  // Format citation based on source type
  formatCitation(source) {
    const formatter = this.citationFormats[source.type]
    if (!formatter) {
      return {
        type: 'unknown',
        title: source.title || 'Unknown Source',
        format: `[${source.title || 'Unknown'}]`
      }
    }

    return formatter(source, source.pageNumber || source.timestamp)
  }

  // Ensure every paragraph has citations
  validateParagraphCitations(text, citations) {
    const paragraphs = text.split('\n\n')
    const issues = []

    paragraphs.forEach((paragraph, index) => {
      const trimmed = paragraph.trim()
      
      // Skip very short paragraphs or headings
      if (trimmed.length < 50 || trimmed.match(/^#+\s/)) {
        return
      }

      const hasCitation = trimmed.match(/\[\d+\]/)
      if (!hasCitation) {
        issues.push({
          paragraph: index + 1,
          text: trimmed.substring(0, 100) + '...',
          issue: 'Missing citation',
          suggestion: 'Add citation [X] where X is a valid source number'
        })
      }
    })

    return issues
  }

  // Find missing citation numbers
  findMissingCitations(text, citations) {
    const usedNumbers = citations.map(c => c.id)
    const allNumbers = Array.from({ length: Math.max(...usedNumbers) }, (_, i) => i + 1)
    return allNumbers.filter(num => !usedNumbers.includes(num))
  }

  // Generate citation list for the end of document
  generateCitationList(citations) {
    const uniqueCitations = citations.reduce((acc, citation) => {
      if (!acc[citation.id]) {
        acc[citation.id] = citation
      }
      return acc
    }, {})

    return Object.values(uniqueCitations)
      .sort((a, b) => a.id - b.id)
      .map(citation => {
        let citationText = `${citation.id}. ${citation.title}`
        
        if (citation.type === 'pdf' && citation.page !== 'N/A') {
          citationText += `, p. ${citation.page}`
        } else if (citation.type === 'youtube' && citation.timestamp) {
          citationText += ` [${citation.timestamp}]`
          if (citation.url) {
            citationText += ` (${citation.url})`
          }
        }

        return citationText
      })
  }

  // Add citations to text automatically
  async addCitationsToText(text, evidence, aiService) {
    const paragraphs = text.split('\n\n')
    const citedParagraphs = []

    for (let i = 0; i < paragraphs.length; i++) {
      const paragraph = paragraphs[i]
      const trimmed = paragraph.trim()

      // Skip short paragraphs or headings
      if (trimmed.length < 50 || trimmed.match(/^#+\s/)) {
        citedParagraphs.push(paragraph)
        continue
      }

      // Find best evidence for this paragraph
      const bestEvidence = await this.findBestEvidenceForParagraph(trimmed, evidence)
      
      if (bestEvidence.length > 0) {
        // Add citation at the end of paragraph
        const citationNumbers = bestEvidence.map((ev, idx) => idx + 1).join(', ')
        const citedParagraph = trimmed + ` [${citationNumbers}]`
        citedParagraphs.push(citedParagraph)
      } else {
        citedParagraphs.push(paragraph)
      }
    }

    return citedParagraphs.join('\n\n')
  }

  // Find best evidence for a paragraph using semantic similarity
  async findBestEvidenceForParagraph(paragraph, evidence) {
    // Simple keyword matching for now (could use embeddings)
    const keywords = this.extractKeywords(paragraph)
    const scoredEvidence = []

    evidence.forEach((ev, index) => {
      const score = this.calculateRelevanceScore(keywords, ev.text)
      if (score > 0.1) {
        scoredEvidence.push({
          ...ev,
          score: score,
          index: index
        })
      }
    })

    // Return top 3 most relevant pieces of evidence
    return scoredEvidence
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
  }

  // Extract keywords from text
  extractKeywords(text) {
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they'])
    
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word))
      .slice(0, 10)
  }

  // Calculate relevance score between keywords and evidence
  calculateRelevanceScore(keywords, evidenceText) {
    const evidenceWords = evidenceText.toLowerCase().split(/\s+/)
    let matches = 0

    keywords.forEach(keyword => {
      if (evidenceWords.includes(keyword)) {
        matches++
      }
    })

    return matches / keywords.length
  }

  // Verify all citations are valid and properly formatted
  verifyCitations(text, sources) {
    const verification = {
      valid: true,
      issues: [],
      suggestions: []
    }

    // Check for citation format
    const invalidFormats = text.match(/\[([^\d\]]+)\]/g)
    if (invalidFormats) {
      verification.valid = false
      verification.issues.push('Invalid citation format found')
      verification.suggestions.push('Use format [1], [2], [3] etc.')
    }

    // Check for missing citations in paragraphs
    const paragraphIssues = this.validateParagraphCitations(text, sources)
    if (paragraphIssues.length > 0) {
      verification.valid = false
      verification.issues.push('Some paragraphs lack citations')
      verification.suggestions.push('Add citations to all substantive paragraphs')
    }

    // Check for citation continuity
    const extracted = this.extractAndValidateCitations(text, sources)
    if (extracted.missingCitations.length > 0) {
      verification.issues.push(`Missing citations: ${extracted.missingCitations.join(', ')}`)
    }

    return verification
  }

  // Generate inline citations with proper formatting
  generateInlineCitations(sources) {
    return sources.map((source, index) => {
      const citation = this.formatCitation(source)
      return {
        id: index + 1,
        inline: `[${index + 1}]`,
        formatted: citation.format,
        full: citation
      }
    })
  }

  // Create citation metadata for storage
  createCitationMetadata(source, evidenceIndex) {
    return {
      id: evidenceIndex + 1,
      sourceId: source.id,
      type: source.type,
      title: source.title,
      filename: source.filename,
      page: source.pageNumber || null,
      timestamp: source.timestamp || null,
      url: source.url || null,
      text: source.text || source.content?.substring(0, 500),
      createdAt: new Date().toISOString()
    }
  }

  // Update citations after text editing
  updateCitationsAfterEdit(originalText, editedText, citations) {
    // This is a complex task - for now, return original citations
    // In a full implementation, this would track citation positions
    return {
      citations: citations,
      needsReview: true,
      message: 'Citations may need manual review after editing'
    }
  }
}

module.exports = CitationSystem
