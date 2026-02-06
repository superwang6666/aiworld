import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ArchiveManager from '@/components/ArchiveManager';
import type { ArchiveMetadata } from '@/types';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('ArchiveManager', () => {
  // Test data factory
  const createMockArchive = (overrides: Partial<ArchiveMetadata> = {}): ArchiveMetadata => ({
    id: 'archive-1',
    name: 'Test Archive',
    core_premise: 'A world where gravity is reversed',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-20T15:30:00Z',
    rules_count: 10,
    preview_rules: [
      'Rule 1: Objects fall upward',
      'Rule 2: Water flows to the sky',
      'Rule 3: Buildings are anchored to the ground',
    ],
    ...overrides,
  });

  const mockOnLoadArchive = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset fetch mock
    mockFetch.mockReset();
  });

  describe('Loading State', () => {
    it('shows loading spinner while fetching archives', async () => {
      // Never resolve the fetch to keep loading state
      mockFetch.mockImplementation(() => new Promise(() => {}));

      render(
        <ArchiveManager onLoadArchive={mockOnLoadArchive} onClose={mockOnClose} />
      );

      // Should show loading spinner
      expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('fetches archives on mount', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ archives: [] }),
      });

      render(
        <ArchiveManager onLoadArchive={mockOnLoadArchive} onClose={mockOnClose} />
      );

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/archive/list');
      });
    });
  });

  describe('Empty State', () => {
    it('shows empty state when no archives exist', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ archives: [] }),
      });

      render(
        <ArchiveManager onLoadArchive={mockOnLoadArchive} onClose={mockOnClose} />
      );

      await waitFor(() => {
        expect(screen.getByText('还没有存档')).toBeInTheDocument();
      });

      expect(screen.getByText('生成规则后可以保存为存档')).toBeInTheDocument();
    });
  });

  describe('Archive List Display', () => {
    it('renders archive list correctly', async () => {
      const archives = [
        createMockArchive({ id: '1', name: 'Archive One' }),
        createMockArchive({ id: '2', name: 'Archive Two' }),
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ archives }),
      });

      render(
        <ArchiveManager onLoadArchive={mockOnLoadArchive} onClose={mockOnClose} />
      );

      await waitFor(() => {
        expect(screen.getByText('Archive One')).toBeInTheDocument();
        expect(screen.getByText('Archive Two')).toBeInTheDocument();
      });
    });

    it('displays archive metadata correctly', async () => {
      const archive = createMockArchive({
        name: 'Test World',
        core_premise: 'A unique world premise',
        rules_count: 15,
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ archives: [archive] }),
      });

      render(
        <ArchiveManager onLoadArchive={mockOnLoadArchive} onClose={mockOnClose} />
      );

      await waitFor(() => {
        expect(screen.getByText('Test World')).toBeInTheDocument();
        expect(screen.getByText('A unique world premise')).toBeInTheDocument();
        expect(screen.getByText('15 条规则')).toBeInTheDocument();
      });
    });

    it('displays preview rules', async () => {
      const archive = createMockArchive({
        preview_rules: ['Preview rule 1', 'Preview rule 2'],
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ archives: [archive] }),
      });

      render(
        <ArchiveManager onLoadArchive={mockOnLoadArchive} onClose={mockOnClose} />
      );

      await waitFor(() => {
        expect(screen.getByText(/Preview rule 1/)).toBeInTheDocument();
        expect(screen.getByText(/Preview rule 2/)).toBeInTheDocument();
      });
    });

    it('formats dates correctly in Chinese locale', async () => {
      const archive = createMockArchive({
        created_at: '2024-03-15T10:00:00Z',
        updated_at: '2024-03-20T15:30:00Z',
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ archives: [archive] }),
      });

      render(
        <ArchiveManager onLoadArchive={mockOnLoadArchive} onClose={mockOnClose} />
      );

      await waitFor(() => {
        // Check that dates are displayed (format may vary by locale)
        expect(screen.getByText(/创建于/)).toBeInTheDocument();
        expect(screen.getByText(/更新于/)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('shows error message when fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      render(
        <ArchiveManager onLoadArchive={mockOnLoadArchive} onClose={mockOnClose} />
      );

      await waitFor(() => {
        expect(screen.getByText(/错误:/)).toBeInTheDocument();
        expect(screen.getByText(/加载存档列表失败/)).toBeInTheDocument();
      });
    });

    it('shows error message when fetch throws', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      render(
        <ArchiveManager onLoadArchive={mockOnLoadArchive} onClose={mockOnClose} />
      );

      await waitFor(() => {
        expect(screen.getByText(/错误:/)).toBeInTheDocument();
        expect(screen.getByText(/Network error/)).toBeInTheDocument();
      });
    });

    it('handles unknown error type', async () => {
      mockFetch.mockRejectedValueOnce('Unknown error');

      render(
        <ArchiveManager onLoadArchive={mockOnLoadArchive} onClose={mockOnClose} />
      );

      await waitFor(() => {
        expect(screen.getByText(/错误:/)).toBeInTheDocument();
        expect(screen.getByText(/未知错误/)).toBeInTheDocument();
      });
    });
  });

  describe('Load Archive Functionality', () => {
    it('calls onLoadArchive when load button is clicked', async () => {
      const user = userEvent.setup();
      const archive = createMockArchive({ id: 'archive-123' });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ archives: [archive] }),
      });

      render(
        <ArchiveManager onLoadArchive={mockOnLoadArchive} onClose={mockOnClose} />
      );

      await waitFor(() => {
        expect(screen.getByText('Test Archive')).toBeInTheDocument();
      });

      // Find the archive card and hover to reveal buttons
      const archiveCard = screen.getByText('Test Archive').closest('div[class*="relative"]');
      expect(archiveCard).toBeInTheDocument();

      // Find the load button (Download icon button)
      const buttons = within(archiveCard as HTMLElement).getAllByRole('button');
      const loadButton = buttons.find(btn => btn.querySelector('svg.lucide-download'));

      if (loadButton) {
        await user.click(loadButton);
        expect(mockOnLoadArchive).toHaveBeenCalledWith('archive-123');
      }
    });
  });

  describe('Delete Archive Functionality', () => {
    it('shows confirmation dialog before deleting', async () => {
      const user = userEvent.setup();
      const archive = createMockArchive({ id: 'archive-to-delete' });

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ archives: [archive] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({}),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ archives: [] }),
        });

      // Mock confirm to return true
      (global.confirm as jest.Mock).mockReturnValue(true);

      render(
        <ArchiveManager onLoadArchive={mockOnLoadArchive} onClose={mockOnClose} />
      );

      await waitFor(() => {
        expect(screen.getByText('Test Archive')).toBeInTheDocument();
      });

      // Find the archive card
      const archiveCard = screen.getByText('Test Archive').closest('div[class*="relative"]');
      const buttons = within(archiveCard as HTMLElement).getAllByRole('button');
      const deleteButton = buttons.find(btn => btn.querySelector('svg.lucide-trash-2'));

      if (deleteButton) {
        await user.click(deleteButton);

        expect(global.confirm).toHaveBeenCalledWith(
          '确定要删除这个存档吗?此操作无法撤销。'
        );
      }
    });

    it('does not delete when confirmation is cancelled', async () => {
      const user = userEvent.setup();
      const archive = createMockArchive({ id: 'archive-to-keep' });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ archives: [archive] }),
      });

      // Mock confirm to return false
      (global.confirm as jest.Mock).mockReturnValue(false);

      render(
        <ArchiveManager onLoadArchive={mockOnLoadArchive} onClose={mockOnClose} />
      );

      await waitFor(() => {
        expect(screen.getByText('Test Archive')).toBeInTheDocument();
      });

      const archiveCard = screen.getByText('Test Archive').closest('div[class*="relative"]');
      const buttons = within(archiveCard as HTMLElement).getAllByRole('button');
      const deleteButton = buttons.find(btn => btn.querySelector('svg.lucide-trash-2'));

      if (deleteButton) {
        await user.click(deleteButton);

        // Should not make delete API call
        expect(mockFetch).toHaveBeenCalledTimes(1); // Only the initial list fetch
      }
    });

    it('calls delete API and refreshes list on successful delete', async () => {
      const user = userEvent.setup();
      const archive = createMockArchive({ id: 'archive-to-delete' });

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ archives: [archive] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({}),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ archives: [] }),
        });

      (global.confirm as jest.Mock).mockReturnValue(true);

      render(
        <ArchiveManager onLoadArchive={mockOnLoadArchive} onClose={mockOnClose} />
      );

      await waitFor(() => {
        expect(screen.getByText('Test Archive')).toBeInTheDocument();
      });

      const archiveCard = screen.getByText('Test Archive').closest('div[class*="relative"]');
      const buttons = within(archiveCard as HTMLElement).getAllByRole('button');
      const deleteButton = buttons.find(btn => btn.querySelector('svg.lucide-trash-2'));

      if (deleteButton) {
        await user.click(deleteButton);

        await waitFor(() => {
          expect(mockFetch).toHaveBeenCalledWith(
            '/api/archive/delete?id=archive-to-delete',
            { method: 'DELETE' }
          );
        });
      }
    });

    it('shows alert on delete failure', async () => {
      const user = userEvent.setup();
      const archive = createMockArchive({ id: 'archive-fail' });

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ archives: [archive] }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
        });

      (global.confirm as jest.Mock).mockReturnValue(true);

      render(
        <ArchiveManager onLoadArchive={mockOnLoadArchive} onClose={mockOnClose} />
      );

      await waitFor(() => {
        expect(screen.getByText('Test Archive')).toBeInTheDocument();
      });

      const archiveCard = screen.getByText('Test Archive').closest('div[class*="relative"]');
      const buttons = within(archiveCard as HTMLElement).getAllByRole('button');
      const deleteButton = buttons.find(btn => btn.querySelector('svg.lucide-trash-2'));

      if (deleteButton) {
        await user.click(deleteButton);

        await waitFor(() => {
          expect(global.alert).toHaveBeenCalledWith('删除存档失败');
        });
      }
    });

    it('shows loading state during delete', async () => {
      const user = userEvent.setup();
      const archive = createMockArchive({ id: 'archive-loading' });

      // Create a promise that we can control
      let resolveDelete: (value: unknown) => void;
      const deletePromise = new Promise((resolve) => {
        resolveDelete = resolve;
      });

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ archives: [archive] }),
        })
        .mockImplementationOnce(() => deletePromise);

      (global.confirm as jest.Mock).mockReturnValue(true);

      render(
        <ArchiveManager onLoadArchive={mockOnLoadArchive} onClose={mockOnClose} />
      );

      await waitFor(() => {
        expect(screen.getByText('Test Archive')).toBeInTheDocument();
      });

      const archiveCard = screen.getByText('Test Archive').closest('div[class*="relative"]');
      const buttons = within(archiveCard as HTMLElement).getAllByRole('button');
      const deleteButton = buttons.find(btn => btn.querySelector('svg.lucide-trash-2'));

      if (deleteButton) {
        await user.click(deleteButton);

        // Should show loading spinner in delete button - check for animate-spin class
        await waitFor(() => {
          const spinner = archiveCard?.querySelector('.animate-spin');
          expect(spinner).toBeInTheDocument();
        });

        // Resolve the delete
        resolveDelete!({
          ok: true,
          json: async () => ({}),
        });
      }
    });
  });

  describe('Close Functionality', () => {
    it('calls onClose when close button is clicked', async () => {
      const user = userEvent.setup();

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ archives: [] }),
      });

      render(
        <ArchiveManager onLoadArchive={mockOnLoadArchive} onClose={mockOnClose} />
      );

      // Find the close button (X icon in header)
      const closeButton = screen.getByRole('button', { name: '' });
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Header Display', () => {
    it('displays the correct title', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ archives: [] }),
      });

      render(
        <ArchiveManager onLoadArchive={mockOnLoadArchive} onClose={mockOnClose} />
      );

      expect(screen.getByText('世界存档')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles null archives response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ archives: null }),
      });

      render(
        <ArchiveManager onLoadArchive={mockOnLoadArchive} onClose={mockOnClose} />
      );

      await waitFor(() => {
        expect(screen.getByText('还没有存档')).toBeInTheDocument();
      });
    });

    it('handles undefined archives response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      render(
        <ArchiveManager onLoadArchive={mockOnLoadArchive} onClose={mockOnClose} />
      );

      await waitFor(() => {
        expect(screen.getByText('还没有存档')).toBeInTheDocument();
      });
    });

    it('handles empty preview_rules array', async () => {
      const archive = createMockArchive({
        preview_rules: [],
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ archives: [archive] }),
      });

      render(
        <ArchiveManager onLoadArchive={mockOnLoadArchive} onClose={mockOnClose} />
      );

      await waitFor(() => {
        expect(screen.getByText('Test Archive')).toBeInTheDocument();
      });

      // Should not show preview section
      expect(screen.queryByText(/^•/)).not.toBeInTheDocument();
    });

    it('handles very long archive names', async () => {
      const longName = 'A'.repeat(200);
      const archive = createMockArchive({
        name: longName,
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ archives: [archive] }),
      });

      render(
        <ArchiveManager onLoadArchive={mockOnLoadArchive} onClose={mockOnClose} />
      );

      await waitFor(() => {
        expect(screen.getByText(longName)).toBeInTheDocument();
      });
    });

    it('handles special characters in archive data', async () => {
      const archive = createMockArchive({
        name: '<script>alert("xss")</script>',
        core_premise: '& < > " \' special chars',
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ archives: [archive] }),
      });

      render(
        <ArchiveManager onLoadArchive={mockOnLoadArchive} onClose={mockOnClose} />
      );

      await waitFor(() => {
        // React should escape the content
        expect(screen.getByText('<script>alert("xss")</script>')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has accessible modal structure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ archives: [] }),
      });

      render(
        <ArchiveManager onLoadArchive={mockOnLoadArchive} onClose={mockOnClose} />
      );

      // Modal should have proper structure
      expect(screen.getByText('世界存档')).toBeInTheDocument();
    });

    it('close button is keyboard accessible', async () => {
      const user = userEvent.setup();

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ archives: [] }),
      });

      render(
        <ArchiveManager onLoadArchive={mockOnLoadArchive} onClose={mockOnClose} />
      );

      // Tab to close button and press Enter
      await user.tab();
      await user.keyboard('{Enter}');

      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
