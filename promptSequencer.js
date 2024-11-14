const OpenAI = require('openai');
require('dotenv').config();

class PromptSequencer {
  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is required. Please set OPENAI_API_KEY in your .env file.');
    }
    
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.memory = [];
    this.sequences = [];
    this.globalContext = '';
  }

  setGlobalContext(context) {
    this.globalContext = context;
  }

  getMemoryLog() {
    return this.memory;
  }

  addPrompt(sequence) {
    // Validate role
    const validRoles = ['system', 'assistant', 'user', 'function', 'tool'];
    const role = sequence.role || 'user';
    
    if (!validRoles.includes(role)) {
      throw new Error(`Invalid role: ${role}. Must be one of: ${validRoles.join(', ')}`);
    }

    // Ensure temperature is a number
    const temperature = typeof sequence.temperature === 'string' ? 
      Number(sequence.temperature) : sequence.temperature || 1;

    // Ensure maxTokens is a number if provided
    const maxTokens = sequence.maxTokens ? 
      (typeof sequence.maxTokens === 'string' ? Number(sequence.maxTokens) : sequence.maxTokens) : 
      undefined;

    this.sequences.push({
      role: role,
      content: sequence.content,
      model: sequence.model || 'gpt-3.5-turbo',
      temperature: temperature,
      useMemory: sequence.useMemory || false,
      predecessor: sequence.predecessor || false,
      maxTokens: maxTokens,
      status: 'pending'
    });
  }

  async execute() {
    const results = [];
    
    for (let i = 0; i < this.sequences.length; i++) {
      const sequence = this.sequences[i];
      const messages = [];
      
      if (this.globalContext) {
        messages.push({ role: 'system', content: this.globalContext });
      }

      if (sequence.useMemory) {
        messages.push(...this.memory);
      }

      if (sequence.predecessor && i > 0) {
        const pred = this.sequences[i - 1];
        messages.push({ role: pred.role, content: pred.content });
      }

      messages.push({ role: sequence.role, content: sequence.content });

      try {
        const completion = {
          model: sequence.model,
          messages: messages,
          temperature: sequence.temperature
        };

        if (sequence.maxTokens) {
          completion.max_tokens = sequence.maxTokens;
        }

        const response = await this.openai.chat.completions.create(completion);
        const result = response.choices[0].message.content;
        const wasIncomplete = response.choices[0].finish_reason !== 'stop';
        
        results.push({
          content: result,
          status: wasIncomplete ? 'incomplete' : 'complete',
          sequenceNumber: i + 1
        });
        
        this.memory.push({ 
          role: sequence.role, 
          content: sequence.content
        });
        
        this.memory.push({ 
          role: 'assistant', 
          content: result
        });
        
        sequence.status = wasIncomplete ? 'incomplete' : 'complete';
      } catch (error) {
        console.error(`Error in sequence ${i + 1}:`, error);
        throw new Error(`Error in sequence ${i + 1}: ${error.message}`);
      }
    }
    
    return results;
  }

  clearMemory() {
    this.memory = [];
  }

  clearSequences() {
    this.sequences = [];
  }
}

module.exports = PromptSequencer;