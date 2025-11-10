// Mock for pdf.js in test environment
module.exports = {
  getDocument: jest.fn(() => ({
    promise: Promise.resolve({
      numPages: 1,
      getPage: jest.fn(() =>
        Promise.resolve({
          getTextContent: jest.fn(() =>
            Promise.resolve({
              items: [{ str: "Hello PDF World" }],
            })
          ),
        })
      ),
    }),
  })),
  GlobalWorkerOptions: { workerSrc: "" }
};