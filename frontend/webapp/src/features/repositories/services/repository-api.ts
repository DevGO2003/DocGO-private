// Stub for repo name fetch.
export const repositoryAPI = {
  getRepository: async (id: string) => {
    // Mock repository data
    return {
      data: {
        id: id,
        name: `Repository ${id.substring(0, 4)}`, // Mock name
      },
    };
  },
};
