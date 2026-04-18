const AIProviders = require('./aiProviders')

class WritingPipeline {
  constructor() {
    this.aiProviders = new AIProviders()
  }

  async processQuery(query, relevantDocuments) {
    try {
      console.log('🚀 Starting writing pipeline for query:', query)

      // Step 1: Planner - Analyze the query and create a plan
      const plan = await this.planner(query, relevantDocuments)
      console.log('📋 Plan created:', plan.summary)

      // Step 2: Researcher - Find and analyze relevant information
      const research = await this.researcher(query, relevantDocuments, plan)
      console.log('🔍 Research completed:', research.findings.length, 'findings')

      // Step 3: Writer - Generate the initial response
      const draft = await this.writer(query, research, plan)
      console.log('✍️ Draft generated:', draft.length, 'characters')

      // Step 4: Editor - Refine and improve the response
      const edited = await this.editor(draft, research, plan)
      console.log('✅ Response edited and refined')

      // Step 5: Citation Verifier - Add proper citations
      const finalResponse = await this.citationVerifier(edited, research)
      console.log('📚 Citations added:', finalResponse.citations.length, 'citations')

      return {
        content: finalResponse.content,
        citations: finalResponse.citations,
        sources: finalResponse.sources,
        metadata: {
          plan: plan,
          research: research,
          processingTime: Date.now()
        }
      }

    } catch (error) {
      console.error('❌ Error in writing pipeline:', error)
      throw error
    }
  }

  async planner(query, documents) {
    const messages = [
      {
        role: 'system',
        content: `You are a research planning AI. Analyze the user's query and create a structured plan for answering it.

Available documents:
${documents.map(doc => `- ${doc.title} (${doc.type})`).join('\n')}

Your task:
1. Understand what the user is asking for
2. Identify key information needed to answer
3. Determine the best approach to structure the response
4. Plan what type of analysis is required

Respond with a JSON object:
{
  "queryType": "factual/explanatory/comparative/analytical",
  "keyTopics": ["topic1", "topic2"],
  "requiredInfo": ["info1", "info2"],
  "responseStructure": "brief/detailed/comprehensive",
  "analysisApproach": "direct/compare/contrast/explain",
  "summary": "Brief summary of your plan"
}`
      },
      {
        role: 'user',
        content: `User query: ${query}

Please create a plan to answer this question effectively.`
      }
    ]

    try {
      const response = await this.aiProviders.callOpenRouter(
        this.aiProviders.providers.openrouter.models.planner,
        messages,
        0.3
      )

      // Parse JSON response
      const plan = JSON.parse(response)
      return plan
    } catch (error) {
      console.error('Planner error:', error)
      // Fallback plan
      return {
        queryType: 'general',
        keyTopics: ['general'],
        requiredInfo: ['answer'],
        responseStructure: 'detailed',
        analysisApproach: 'explain',
        summary: 'General response plan'
      }
    }
  }

  async researcher(query, documents, plan) {
    const messages = [
      {
        role: 'system',
        content: `You are a research analyst. Find the most relevant information from the provided documents to answer the user's query.

Plan for analysis:
${JSON.stringify(plan, null, 2)}

Documents to analyze:
${documents.map(doc => `
Document: ${doc.title}
Type: ${doc.type}
Content: ${doc.content.substring(0, 2000)}...
`).join('\n---\n')}

Your task:
1. Find the most relevant passages for each key topic
2. Extract specific quotes and data points
3. Identify contradictions or complementary information
4. Note any gaps in the available information

Respond with a JSON object:
{
  "findings": [
    {
      "topic": "topic name",
      "relevantPassages": ["quote1", "quote2"],
      "dataPoints": ["fact1", "fact2"],
      "sourceDocuments": ["doc1", "doc2"],
      "confidence": "high/medium/low"
    }
  ],
  "gaps": ["missing information"],
  "contradictions": ["conflicting info"],
  "summary": "Brief summary of findings"
}`
      },
      {
        role: 'user',
        content: `User query: ${query}

Please research this query using the provided documents and plan.`
      }
    ]

    try {
      const response = await this.aiProviders.callGroq(
        this.aiProviders.providers.groq.models.researcher,
        messages,
        0.2
      )

      const research = JSON.parse(response)
      return research
    } catch (error) {
      console.error('Researcher error:', error)
      // Fallback research
      return {
        findings: [{
          topic: 'general',
          relevantPassages: ['No specific findings available'],
          dataPoints: [],
          sourceDocuments: documents.map(d => d.title),
          confidence: 'low'
        }],
        gaps: ['Full analysis not available'],
        contradictions: [],
        summary: 'Limited research completed'
      }
    }
  }

  async writer(query, research, plan) {
    const messages = [
      {
        role: 'system',
        content: `You are an expert academic writer. Write a comprehensive, nuanced, and detailed response to the user's query based on the research findings.

Research findings:
${JSON.stringify(research, null, 2)}

Plan:
${JSON.stringify(plan, null, 2)}

Writing requirements:
- Write in an A+ academic style
- Be nuanced and detailed
- Include specific examples and evidence
- Structure the response logically
- Use clear, expressive language
- Address complexity and subtlety
- Provide depth of analysis

Write a comprehensive response that demonstrates deep understanding of the topic.`
      },
      {
        role: 'user',
        content: `User query: ${query}

Please write a comprehensive response based on the research findings.`
      }
    ]

    try {
      const response = await this.aiProviders.callOpenRouter(
        this.aiProviders.providers.openrouter.models.writer,
        messages,
        0.7
      )

      return response
    } catch (error) {
      console.error('Writer error:', error)
      return `I apologize, but I'm currently unable to generate a comprehensive response. Please try again later.`
    }
  }

  async editor(draft, research, plan) {
    const messages = [
      {
        role: 'system',
        content: `You are an expert editor. Review and improve the following draft to make it more polished, clear, and impactful.

Original draft:
${draft}

Research context:
${JSON.stringify(research, null, 2)}

Editing requirements:
- Improve clarity and flow
- Enhance academic tone
- Fix any grammatical issues
- Ensure logical structure
- Add transitions between ideas
- Strengthen arguments
- Remove redundancy
- Check for accuracy

Provide the edited version of the draft.`
      },
      {
        role: 'user',
        content: 'Please edit this draft to improve its quality and clarity.'
      }
    ]

    try {
      const response = await this.aiProviders.callOpenRouter(
        this.aiProviders.providers.openrouter.models.editor,
        messages,
        0.5
      )

      return response
    } catch (error) {
      console.error('Editor error:', error)
      return draft // Return original if editing fails
    }
  }

  async citationVerifier(content, research) {
    const messages = [
      {
        role: 'system',
        content: `You are a citation specialist. Review the content and add proper inline citations based on the research findings.

Content to cite:
${content}

Research findings with sources:
${JSON.stringify(research, null, 2)}

Citation requirements:
- Add inline citations [1], [2], etc. where appropriate
- Create a citation list at the end
- Ensure every claim is properly cited
- Format citations consistently
- Include page numbers or timestamps when available

Respond with a JSON object:
{
  "content": "content with inline citations",
  "citations": [
    {
      "id": 1,
      "title": "document title",
      "page": "page number",
      "timestamp": "time",
      "text": "quoted text"
    }
  ],
  "sources": ["source1", "source2"]
}`
      },
      {
        role: 'user',
        content: 'Please add proper citations to this content.'
      }
    ]

    try {
      const response = await this.aiProviders.callGroq(
        this.aiProviders.providers.groq.models.fast,
        messages,
        0.3
      )

      const citedContent = JSON.parse(response)
      return citedContent
    } catch (error) {
      console.error('Citation verifier error:', error)
      // Fallback - add basic citations
      return {
        content: content,
        citations: research.findings.flatMap(f => 
          f.sourceDocuments.map((doc, idx) => ({
            id: idx + 1,
            title: doc,
            text: f.relevantPassages[0] || 'Source reference'
          }))
        ),
        sources: research.findings.flatMap(f => f.sourceDocuments)
      }
    }
  }
}

module.exports = WritingPipeline
