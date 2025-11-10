import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import LocalViewer from '../pages/LocalViewer';
import { getAllFolderHandles } from '../utils/fsStorage';
import { extractFileData } from '../utils/fileProcessor';

// --- Mock required modules ---
jest.mock('../utils/fsStorage', () => ({
  getAllFolderHandles: jest.fn(),
}));

jest.mock('../utils/fileProcessor', () => ({
  extractFileData: jest.fn(),
}));

// --- Mock localStorage ---
let __store = {};
const mockLocalStorage = {
  getItem: (key) => (__store[key] === undefined ? null : __store[key]),
  setItem: (key, value) => { __store[key] = value; },
  clear: () => { __store = {}; },
};
global.localStorage = mockLocalStorage;

// --- Mock URL APIs (for Blob URLs) ---
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = jest.fn();

describe('LocalViewer Component', () => {
  const mockFolderId = '123';
  const mockUser = 'testUser';
  const mockSources = [{ id: '123', name: 'Test Folder' }];

  beforeEach(() => {
    jest.clearAllMocks();
    __store = {};
    mockLocalStorage.clear();

    localStorage.setItem('authUser', mockUser);
    localStorage.setItem(`localSources_${mockUser}`, JSON.stringify(mockSources));

    if (extractFileData?.mockReset) extractFileData.mockReset();
  });

  const renderLocalViewer = () => {
    return render(
      <MemoryRouter initialEntries={[`/local/${mockFolderId}`]}>
        <Routes>
          <Route path="/local/:id" element={<LocalViewer />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('renders folder name from localStorage', async () => {
    getAllFolderHandles.mockResolvedValue([
      { id: '123', handle: { values: async function* () { yield* []; } } },
    ]);

    renderLocalViewer();
    expect(await screen.findByText('Test Folder')).toBeInTheDocument();
  });

  it('shows "Folder not found" when no saved sources exist', async () => {
    localStorage.setItem(`localSources_${mockUser}`, JSON.stringify([]));
    getAllFolderHandles.mockResolvedValue([]);
    renderLocalViewer();
    expect(await screen.findByText('Folder not found.')).toBeInTheDocument();
  });

  it('lists files from folder', async () => {
    const mockFiles = [
      { kind: 'file', name: 'test1.txt' },
      { kind: 'file', name: 'test2.pdf' },
    ];

    getAllFolderHandles.mockResolvedValue([
      {
        id: '123',
        handle: {
          values: async function* () {
            yield* mockFiles;
          },
        },
      },
    ]);

    renderLocalViewer();

    await waitFor(() => {
      expect(screen.getByText('test1.txt')).toBeInTheDocument();
      expect(screen.getByText('test2.pdf')).toBeInTheDocument();
    });
  });

  it('renders modal when file clicked and closes when backdrop clicked', async () => {
    const mockFile = {
      kind: 'file',
      name: 'test.txt',
      getFile: () => Promise.resolve({
        name: 'test.txt',
        type: 'text/plain',
        size: 100,
        lastModified: Date.now(),
        text: () => Promise.resolve('Sample text'),
      }),
    };

    getAllFolderHandles.mockResolvedValue([
      {
        id: '123',
        handle: {
          values: async function* () {
            yield mockFile;
          },
        },
      },
    ]);

    extractFileData.mockResolvedValue({
      name: 'test.txt',
      type: 'text/plain',
      sizeKB: '0.10',
      created: new Date().toLocaleString(),
      language: 'English',
      textSnippet: 'Sample text',
    });

    renderLocalViewer();

    const fileElement = await screen.findByText('test.txt');
    fireEvent.click(fileElement);

    await waitFor(() => {
      expect(screen.getByText('Metadata')).toBeInTheDocument();
    });

    const backdrop = screen.getByTestId('modal-backdrop');
    fireEvent.click(backdrop);

    await waitFor(() => {
      expect(screen.queryByText('Metadata')).not.toBeInTheDocument();
    });
  });

  it('displays "Unknown" for short text', async () => {
    const mockFile = {
      kind: 'file',
      name: 'short.txt',
      getFile: () => Promise.resolve({
        name: 'short.txt',
        type: 'text/plain',
        size: 100,
        lastModified: Date.now(),
        text: () => Promise.resolve('Hi'),
      }),
    };

    getAllFolderHandles.mockResolvedValue([
      {
        id: '123',
        handle: {
          values: async function* () {
            yield mockFile;
          },
        },
      },
    ]);

    extractFileData.mockResolvedValue({
      name: 'short.txt',
      type: 'text/plain',
      sizeKB: '0.10',
      created: new Date().toLocaleString(),
      language: 'Unknown',
      textSnippet: 'Hi',
    });

    renderLocalViewer();

    const fileElement = await screen.findByText('short.txt');
    fireEvent.click(fileElement);

    await waitFor(() => expect(extractFileData).toHaveBeenCalled());
    expect(await screen.findByText('Unknown')).toBeInTheDocument();
  });
});
