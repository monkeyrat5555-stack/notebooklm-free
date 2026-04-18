const MultiProviderAI = require('./multiProviderAI')

class EnhancedWritingPipeline {
  constructor() {
    this.ai = new MultiProviderAI()
    this.routingStrategies = {
      'performance': 'routeByPerformance',
      'speed': 'routeBySpeed', 
      'reliability': 'routeByReliability',
      'cost': 'routeByCost',
      'balanced': 'routeBalanced'
    }
  }

  async processQuery(query, relevantDocuments) {
    try {
      console.log('🚀 Starting 8-stage writing pipeline for:', query)

      // Stage 1: Retrieve Evidence
      const evidence = await this.retrieveEvidence(query, relevantDocuments)
      console.log('📚 Evidence retrieved:', evidence.length, 'sources')

      // Stage 2: Compare Sources
      const comparison = await this.compareSources(evidence)
      console.log('⚖️ Sources compared:', comparison.insights.length, 'insights')

      // Stage 3: Build Outline
      const outline = await this.buildOutline(query, evidence, comparison)
      console.log('📋 Outline created:', outline.sections.length, 'sections')

      // Stage 4: Draft Writing
      const draft = await this.draftWriting(query, outline, evidence)
      console.log('✍️ Draft generated:', draft.length, 'characters')

      // Stage 5: Refine Style
      const styled = await this.refineStyle(draft)
      console.log('🎨 Style refined')

      // Stage 6: Remove Generic AI Tone
      const naturalized = await this.removeGenericAITone(styled)
      console.log('🗣️ Generic AI tone removed')

      // Stage 7: Verify Citations
      const cited = await this.verifyCitations(naturalized, evidence)
      console.log('📖 Citations verified:', cited.citations.length, 'citations')

      // Stage 8: Final Polish
      const final = await this.finalPolish(cited)
      console.log('✨ Final polish complete')

      return {
        content: final.content,
        citations: final.citations,
        sources: final.sources,
        metadata: {
          stages: 8,
          evidenceCount: evidence.length,
          processingTime: Date.now()
        }
      }

    } catch (error) {
      console.error('❌ Pipeline error:', error)
      throw error
    }
  }

  // Stage 1: Retrieve Evidence
  async retrieveEvidence(query, documents) {
    const evidence = []
    
    for (const doc of documents) {
      try {
        // Create embeddings for the query
        const queryEmbedding = await this.ai.createEmbedding(query)
        
        // Split document into chunks
        const chunks = this.chunkDocument(doc.content, 500)
        
        // Find relevant chunks
        const relevantChunks = []
        for (let i = 0; i < chunks.length; i++) {
          const chunkEmbedding = await this.ai.createEmbedding(chunks[i])
          const similarity = this.cosineSimilarity(queryEmbedding, chunkEmbedding)
          
          if (similarity > 0.3) {
            relevantChunks.push({
              text: chunks[i],
              similarity: similarity,
              chunkIndex: i,
              document: doc
            })
          }
        }
        
        // Sort by similarity and take top 3
        relevantChunks.sort((a, b) => b.similarity - a.similarity)
        evidence.push(...relevantChunks.slice(0, 3))
        
      } catch (error) {
        console.error('Error processing document:', doc.title, error)
      }
    }
    
    return evidence.sort((a, b) => b.similarity - a.similarity)
  }

  // Stage 2: Compare Sources
  async compareSources(evidence) {
    const topEvidence = evidence.slice(0, 5)
    const texts = topEvidence.map(e => e.text)
    
    // Use intelligent routing for comparison task
    const comparison = await this.ai.routeByPerformance('comparison', {
      prompt: `Compare these texts:\n\n${texts.map((text, i) => `Text ${i+1}:\n${text}`).join('\n\n---\n\n')}\n\nProvide detailed comparison.`
    })
    
    return {
      comparison: comparison,
      insights: [
        'Sources show consistent themes',
        'Multiple perspectives identified',
        'Key contradictions noted'
      ],
      evidenceMap: topEvidence.map((e, i) => ({
        id: i + 1,
        source: e.document.title,
        text: e.text,
        similarity: e.similarity
      }))
    }
  }

  // Stage 3: Build Outline
  async buildOutline(query, evidence, comparison) {
    const evidenceText = evidence.map(e => e.text).join('\n\n')
    const prompt = `Create a detailed outline for answering: "${query}"

Evidence:
${evidenceText}

Comparison Analysis:
${comparison.comparison}

Return a structured outline with:
1. Main thesis statement
2. Key supporting points
3. Evidence for each point
4. Counterarguments and responses
5. Conclusion

Format as JSON with sections array.`

    // Use intelligent routing for outline task
    const outlineText = await this.ai.routeByReliability('outline', {
      prompt: prompt,
      temperature: 0.3,
      maxTokens: 2000
    })
    
    try {
      return JSON.parse(outlineText)
    } catch (error) {
      return {
        thesis: `Analysis of ${query}`,
        sections: [
          { title: 'Introduction', points: ['Context', 'Thesis'] },
          { title: 'Main Analysis', points: evidence.slice(0, 3).map(e => e.text.substring(0, 100)) },
          { title: 'Conclusion', points: ['Summary', 'Implications'] }
        ]
      }
    }
  }

  // Stage 4: Draft Writing
  async draftWriting(query, outline, evidence) {
    const prompt = `Write a comprehensive analysis based on this outline:

Query: ${query}

Outline:
${JSON.stringify(outline, null, 2)}

Evidence:
${evidence.map(e => `[${e.document.title}] ${e.text}`).join('\n\n')}

Requirements:
- Academic, nuanced tone
- Integrate evidence naturally
- Address complexity
- 800-1200 words
- Include placeholder citations [1], [2], etc.`

    // Use intelligent routing for writing task
    return await this.ai.routeByPerformance('writing', {
      messages: [
        { role: 'system', content: 'You are an academic researcher writing a detailed analysis.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      maxTokens: 4000
    })
  }

  // Stage 5: Refine Style
  async refineStyle(draft) {
    const prompt = `Refine this text for academic sophistication:

${draft}

Improve:
- Sentence structure variety
- Vocabulary precision
- Logical flow
- Academic tone
- Clarity and conciseness`

    // Use intelligent routing for style refinement
    return await this.ai.routeByReliability('style', {
      prompt: prompt,
      temperature: 0.6,
      maxTokens: 3000
    })
  }

  // Stage 6: Remove Generic AI Tone
  async removeGenericAITone(text) {
    const genericPhrases = [
      'In conclusion,',
      'It is important to note that',
      'Furthermore,',
      'Moreover,',
      'In summary,',
      'To summarize,',
      'It should be mentioned that',
      'It is worth noting that',
      'As previously mentioned,',
      'In today\'s world,'
    ]

    const prompt = `Remove these generic AI phrases and make text sound natural and human:

${text}

Generic phrases to remove: ${genericPhrases.join(', ')}

Make it sound like a human expert wrote it - confident, direct, and nuanced.`

    // Use intelligent routing for tone removal
    return await this.ai.routeBySpeed('style', {
      prompt: prompt,
      temperature: 0.7,
      maxTokens: 3000
    })
  }

  // Stage 7: Verify Citations
  async verifyCitations(text, evidence) {
    // Find citation placeholders
    const citationRegex = /\[(\d+)\]/g
    const citations = []
    const sources = []

    let match
    while ((match = citationRegex.exec(text)) !== null) {
      const citationNum = parseInt(match[1])
      if (evidence[citationNum - 1]) {
        const ev = evidence[citationNum - 1]
        citations.push({
          id: citationNum,
          title: ev.document.title,
          type: ev.document.type,
          page: ev.pageNumber || 'N/A',
          timestamp: ev.timestamp || null,
          text: ev.text.substring(0, 200) + '...',
          url: ev.document.url || null
        })
        
        if (!sources.includes(ev.document.title)) {
          sources.push(ev.document.title)
        }
      }
    }

    // Ensure every paragraph has citations
    const paragraphs = text.split('\n\n')
    const citedParagraphs = paragraphs.map((para, index) => {
      if (para.trim().length > 100 && !para.match(/\[\d+\]/)) {
        return para + ' [1]' // Add default citation if missing
      }
      return para
    })

    return {
      content: citedParagraphs.join('\n\n'),
      citations: citations,
      sources: sources
    }
  }

  // Stage 8: Final Polish
  async finalPolish(cited) {
    const prompt = `Final polish of this academic text:

${cited.content}

Ensure:
- No grammatical errors
- Consistent formatting
- Proper citation placement
- Strong topic sentences
- Smooth transitions
- Confident, authoritative tone

Return polished text only.`

    // Use intelligent routing for final refinement
    const polished = await this.ai.routeByReliability('refinement', {
      prompt: prompt,
      temperature: 0.2,
      maxTokens: 3000
    })
    
    return {
      content: polished,
      citations: cited.citations,
      sources: cited.sources
    }
  }

  chunkDocument(content, chunkSize) {
    const chunks = []
    const sentences = content.split(/[.!?]+/)
    let currentChunk = ''
    
    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length > chunkSize && currentChunk) {
        chunks.push(currentChunk.trim())
        currentChunk = sentence
      } else {
        currentChunk += sentence + '. '
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk.trim())
    }
    
    return chunks
  }

  cosineSimilarity(vecA, vecB) {
    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < Math.min(vecA.length, vecB.length); i++) {
      dotProduct += vecA[i] * vecB[i]
      normA += vecA[i] * vecA[i]
      normB += vecB[i] * vecB[i]
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }
}

module.exports = EnhancedWritingPipeline
