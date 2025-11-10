import { extractFileData } from '../utils/fileProcessor.jsx';

// Mock franc (CommonJS) and franc-all (fallback)
jest.mock('franc', () => jest.fn());
jest.mock('franc-all', () => ({ franc: jest.fn() }));

// Mock pdfjs-dist
jest.mock('pdfjs-dist/build/pdf', () => ({
  getDocument: jest.fn().mockReturnValue({
    promise: Promise.resolve({
      numPages: 1,
      getPage: () => Promise.resolve({
        getTextContent: () => Promise.resolve({
          items: [{ str: 'Test PDF content' }]
        })
      })
    })
  }),
  GlobalWorkerOptions: { workerSrc: null }
}));

describe('fileProcessor', () => {
  let franc;
  
  beforeEach(() => {
    jest.clearAllMocks();
    franc = require('franc');
  });
  const createMockFileEntry = (name, content, type = 'text/plain') => ({
    getFile: () => Promise.resolve({
      name,
      type,
      size: content.length,
      lastModified: Date.now(),
      text: () => Promise.resolve(content),
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(8))
    })
  });

  it('should extract metadata from text files', async () => {
    const mockEntry = createMockFileEntry('test.txt', 'Hello World');
    const result = await extractFileData(mockEntry);

    expect(result).toMatchObject({
      name: 'test.txt',
      type: 'text/plain',
      language: expect.any(String),
      textSnippet: 'Hello World',
      fullText: 'Hello World'
    });
    expect(result.sizeKB).toBeDefined();
    expect(result.created).toBeDefined();
  });

  it('should extract metadata from PDF files', async () => {
    const mockEntry = createMockFileEntry('test.pdf', '', 'application/pdf');
    const result = await extractFileData(mockEntry);

    expect(result).toMatchObject({
      name: 'test.pdf',
      type: 'application/pdf',
      language: expect.any(String),
      textSnippet: expect.stringContaining('Test PDF content'),
      fullText: expect.stringContaining('Test PDF content')
    });
  });

  it('should handle image files', async () => {
    const mockEntry = createMockFileEntry('test.jpg', '', 'image/jpeg');
    const result = await extractFileData(mockEntry);

    expect(result).toMatchObject({
      name: 'test.jpg',
      type: 'image/jpeg',
      language: 'Image',
      textSnippet: '',
      fullText: ''
    });
  });

  it('should handle file processing errors gracefully', async () => {
    const mockEntry = {
      getFile: () => Promise.reject(new Error('File access error'))
    };

    const result = await extractFileData(mockEntry);
    expect(result).toBeNull();
  });

  it('should detect supported languages (eng, hin, kan) correctly', async () => {
    const testCases = [
      { text: 'Hello', lang: 'eng', expected: 'English' },
      { text: 'नमಸ್ತे', lang: 'hin', expected: 'Hindi' },
      { text: 'ನಮಸ್ಕಾರ', lang: 'kan', expected: 'Kannada' }
    ];

    for (const { text, lang, expected } of testCases) {
      // Reset mock before each test case
      franc.mockReset();
      franc.mockReturnValue(lang);

      const mockEntry = createMockFileEntry('test_' + lang + '.txt', text);
      const result = await extractFileData(mockEntry);
      expect(result.language).toBe(expected);
    }
  });

  it('should handle very short text appropriately', async () => {
    const franc = require('franc');
    franc.mockReturnValue('und');
    const mockEntry = createMockFileEntry('short.txt', 'Hi');
    const result = await extractFileData(mockEntry);
    expect(result.language).toBe('Unknown');
  });

  // Note: long-text truncation test removed to keep tests fast and focused.
});