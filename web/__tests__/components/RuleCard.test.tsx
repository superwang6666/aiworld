import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import RuleCard from '@/components/RuleCard';
import type { WorldRule, RuleTag } from '@/types';

// Mock the predefined-tags module
jest.mock('@/config/predefined-tags', () => ({
  getPredefinedTagById: jest.fn((id: string) => {
    const tags: Record<string, { id: string; name: string; weight: number }> = {
      brutal: { id: 'brutal', name: '残酷', weight: 0.7 },
      hopeful: { id: 'hopeful', name: '希望', weight: 0.5 },
      cyclic: { id: 'cyclic', name: '循环', weight: 0.6 },
    };
    return tags[id] || null;
  }),
}));

// Mock the law-names module
jest.mock('@/config/law-names', () => ({
  LAW_NAME_MAP: {
    Space: '空间法则',
    Survival: '生存法则',
    Cognition: '认知法则',
    Scarcity: '稀缺法则',
    Time: '时间法则',
    Power: '权力法则',
    Metaphysics: '形而上学法则',
  },
  LAW_COLORS: {
    Space: {
      border: 'rgba(100, 150, 255, 0.4)',
      hoverBorder: 'rgba(100, 150, 255, 0.6)',
      accent: 'rgba(100, 150, 255, 0.6)',
      glow: '0 0 12px rgba(100, 150, 255, 0.3)',
    },
    Survival: {
      border: 'rgba(100, 200, 120, 0.4)',
      hoverBorder: 'rgba(100, 200, 120, 0.6)',
      accent: 'rgba(100, 200, 120, 0.6)',
      glow: '0 0 12px rgba(100, 200, 120, 0.3)',
    },
    Cognition: {
      border: 'rgba(180, 120, 255, 0.4)',
      hoverBorder: 'rgba(180, 120, 255, 0.6)',
      accent: 'rgba(180, 120, 255, 0.6)',
      glow: '0 0 12px rgba(180, 120, 255, 0.3)',
    },
    Scarcity: {
      border: 'rgba(255, 160, 100, 0.4)',
      hoverBorder: 'rgba(255, 160, 100, 0.6)',
      accent: 'rgba(255, 160, 100, 0.6)',
      glow: '0 0 12px rgba(255, 160, 100, 0.3)',
    },
    Time: {
      border: 'rgba(100, 200, 200, 0.4)',
      hoverBorder: 'rgba(100, 200, 200, 0.6)',
      accent: 'rgba(100, 200, 200, 0.6)',
      glow: '0 0 12px rgba(100, 200, 200, 0.3)',
    },
    Power: {
      border: 'rgba(255, 120, 120, 0.4)',
      hoverBorder: 'rgba(255, 120, 120, 0.6)',
      accent: 'rgba(255, 120, 120, 0.6)',
      glow: '0 0 12px rgba(255, 120, 120, 0.3)',
    },
    Metaphysics: {
      border: 'rgba(255, 220, 100, 0.4)',
      hoverBorder: 'rgba(255, 220, 100, 0.6)',
      accent: 'rgba(255, 220, 100, 0.6)',
      glow: '0 0 12px rgba(255, 220, 100, 0.3)',
    },
  },
}));

describe('RuleCard', () => {
  // Test data factory
  const createMockRule = (overrides: Partial<WorldRule> = {}): WorldRule => ({
    id: 'test-rule-1',
    law: 'Space',
    rule: 'Test rule content',
    expert_logic: 'Test expert logic explanation',
    confirmed: false,
    tags: [],
    discipline_codes: [],
    rejected: false,
    created_at: new Date().toISOString(),
    ...overrides,
  });

  const mockOnToggle = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders rule content correctly', () => {
      const rule = createMockRule({
        rule: 'This is a test rule',
        expert_logic: 'This is the expert logic',
      });

      render(<RuleCard rule={rule} onToggle={mockOnToggle} />);

      expect(screen.getByText('This is a test rule')).toBeInTheDocument();
      expect(screen.getByText(/This is the expert logic/)).toBeInTheDocument();
    });

    it('renders law name in Chinese', () => {
      const rule = createMockRule({ law: 'Space' });

      render(<RuleCard rule={rule} onToggle={mockOnToggle} />);

      expect(screen.getByText('空间法则')).toBeInTheDocument();
    });

    it('renders different law names correctly', () => {
      const laws = [
        { law: 'Survival', expected: '生存法则' },
        { law: 'Cognition', expected: '认知法则' },
        { law: 'Scarcity', expected: '稀缺法则' },
        { law: 'Time', expected: '时间法则' },
        { law: 'Power', expected: '权力法则' },
        { law: 'Metaphysics', expected: '形而上学法则' },
      ] as const;

      laws.forEach(({ law, expected }) => {
        const rule = createMockRule({ law, id: `rule-${law}` });
        const { unmount } = render(<RuleCard rule={rule} onToggle={mockOnToggle} />);
        expect(screen.getByText(expected)).toBeInTheDocument();
        unmount();
      });
    });

    it('renders expert logic section', () => {
      const rule = createMockRule({
        expert_logic: 'Complex expert reasoning here',
      });

      render(<RuleCard rule={rule} onToggle={mockOnToggle} />);

      expect(screen.getByText('专家逻辑:')).toBeInTheDocument();
      expect(screen.getByText(/Complex expert reasoning here/)).toBeInTheDocument();
    });
  });

  describe('Confirmation State', () => {
    it('renders unconfirmed state with X icon', () => {
      const rule = createMockRule({ confirmed: false });

      render(<RuleCard rule={rule} onToggle={mockOnToggle} />);

      const confirmButton = screen.getByRole('button', { name: /confirm rule/i });
      expect(confirmButton).toBeInTheDocument();
    });

    it('renders confirmed state with Check icon', () => {
      const rule = createMockRule({ confirmed: true });

      render(<RuleCard rule={rule} onToggle={mockOnToggle} />);

      const unconfirmButton = screen.getByRole('button', { name: /unconfirm rule/i });
      expect(unconfirmButton).toBeInTheDocument();
    });

    it('calls onToggle when confirm button is clicked', async () => {
      const user = userEvent.setup();
      const rule = createMockRule({ id: 'rule-123' });

      render(<RuleCard rule={rule} onToggle={mockOnToggle} />);

      const confirmButton = screen.getByRole('button', { name: /confirm rule/i });
      await user.click(confirmButton);

      expect(mockOnToggle).toHaveBeenCalledTimes(1);
      expect(mockOnToggle).toHaveBeenCalledWith('rule-123');
    });

    it('applies different opacity for confirmed vs unconfirmed rules', () => {
      const unconfirmedRule = createMockRule({ confirmed: false, id: 'unconfirmed' });
      const confirmedRule = createMockRule({ confirmed: true, id: 'confirmed' });

      const { rerender, container } = render(
        <RuleCard rule={unconfirmedRule} onToggle={mockOnToggle} />
      );

      // Unconfirmed rule should have opacity-70 class
      expect(container.firstChild).toHaveClass('opacity-70');

      rerender(<RuleCard rule={confirmedRule} onToggle={mockOnToggle} />);

      // Confirmed rule should have opacity-100 class
      expect(container.firstChild).toHaveClass('opacity-100');
    });
  });

  describe('Delete Functionality', () => {
    it('renders delete button when onDelete is provided', () => {
      const rule = createMockRule();

      render(
        <RuleCard rule={rule} onToggle={mockOnToggle} onDelete={mockOnDelete} />
      );

      const deleteButton = screen.getByRole('button', { name: /delete rule/i });
      expect(deleteButton).toBeInTheDocument();
    });

    it('does not render delete button when onDelete is not provided', () => {
      const rule = createMockRule();

      render(<RuleCard rule={rule} onToggle={mockOnToggle} />);

      const deleteButton = screen.queryByRole('button', { name: /delete rule/i });
      expect(deleteButton).not.toBeInTheDocument();
    });

    it('calls onDelete when delete button is clicked', async () => {
      const user = userEvent.setup();
      const rule = createMockRule({ id: 'rule-to-delete' });

      render(
        <RuleCard rule={rule} onToggle={mockOnToggle} onDelete={mockOnDelete} />
      );

      const deleteButton = screen.getByRole('button', { name: /delete rule/i });
      await user.click(deleteButton);

      expect(mockOnDelete).toHaveBeenCalledTimes(1);
      expect(mockOnDelete).toHaveBeenCalledWith('rule-to-delete');
    });

    it('disables delete button for rejected rules', () => {
      const rule = createMockRule({ rejected: true });

      render(
        <RuleCard rule={rule} onToggle={mockOnToggle} onDelete={mockOnDelete} />
      );

      const deleteButton = screen.getByRole('button', { name: /rule deleted/i });
      expect(deleteButton).toBeDisabled();
    });

    it('does not call onDelete for rejected rules', async () => {
      const user = userEvent.setup();
      const rule = createMockRule({ rejected: true });

      render(
        <RuleCard rule={rule} onToggle={mockOnToggle} onDelete={mockOnDelete} />
      );

      const deleteButton = screen.getByRole('button', { name: /rule deleted/i });
      await user.click(deleteButton);

      expect(mockOnDelete).not.toHaveBeenCalled();
    });
  });

  describe('Tags Display', () => {
    it('renders predefined tags correctly', () => {
      const rule = createMockRule({
        tags: ['brutal', 'hopeful'],
      });

      render(<RuleCard rule={rule} onToggle={mockOnToggle} />);

      expect(screen.getByText('残酷')).toBeInTheDocument();
      expect(screen.getByText('希望')).toBeInTheDocument();
    });

    it('renders custom tags from tagWeights', () => {
      const rule = createMockRule({
        tags: ['custom-tag-1'],
      });

      const tagWeights: Record<string, RuleTag> = {
        'custom-tag-1': {
          id: 'custom-tag-1',
          name: '自定义标签',
          category: 'tone',
          weight: 0.8,
          usage_count: 5,
          deletion_count: 1,
          source: 'llm',
        },
      };

      render(
        <RuleCard
          rule={rule}
          onToggle={mockOnToggle}
          tagWeights={tagWeights}
        />
      );

      expect(screen.getByText('自定义标签')).toBeInTheDocument();
    });

    it('limits displayed tags to 5 and shows overflow count', () => {
      const rule = createMockRule({
        tags: ['brutal', 'hopeful', 'cyclic', 'tag4', 'tag5', 'tag6', 'tag7'],
      });

      const tagWeights: Record<string, RuleTag> = {
        tag4: { id: 'tag4', name: '标签4', category: 'tone', weight: 0.5, usage_count: 0, deletion_count: 0, source: 'llm' },
        tag5: { id: 'tag5', name: '标签5', category: 'tone', weight: 0.5, usage_count: 0, deletion_count: 0, source: 'llm' },
        tag6: { id: 'tag6', name: '标签6', category: 'tone', weight: 0.5, usage_count: 0, deletion_count: 0, source: 'llm' },
        tag7: { id: 'tag7', name: '标签7', category: 'tone', weight: 0.5, usage_count: 0, deletion_count: 0, source: 'llm' },
      };

      render(
        <RuleCard
          rule={rule}
          onToggle={mockOnToggle}
          tagWeights={tagWeights}
        />
      );

      // Should show +2 for the overflow
      expect(screen.getByText('+2')).toBeInTheDocument();
    });

    it('does not show overflow indicator when tags are 5 or less', () => {
      const rule = createMockRule({
        tags: ['brutal', 'hopeful'],
      });

      render(<RuleCard rule={rule} onToggle={mockOnToggle} />);

      expect(screen.queryByText(/^\+\d+$/)).not.toBeInTheDocument();
    });
  });

  describe('Warning Indicators', () => {
    it('shows warning indicator when deletion_score >= 0.6', () => {
      const rule = createMockRule({
        deletion_score: 0.65,
      });

      render(<RuleCard rule={rule} onToggle={mockOnToggle} showPrediction={true} />);

      expect(screen.getByText('预测')).toBeInTheDocument();
    });

    it('shows danger indicator when deletion_score >= 0.75', () => {
      const rule = createMockRule({
        deletion_score: 0.8,
      });

      render(<RuleCard rule={rule} onToggle={mockOnToggle} showPrediction={true} />);

      expect(screen.getByText('高风险')).toBeInTheDocument();
    });

    it('does not show warning when showPrediction is false', () => {
      const rule = createMockRule({
        deletion_score: 0.8,
      });

      render(<RuleCard rule={rule} onToggle={mockOnToggle} showPrediction={false} />);

      expect(screen.queryByText('高风险')).not.toBeInTheDocument();
      expect(screen.queryByText('预测')).not.toBeInTheDocument();
    });

    it('shows prediction score message when deletion_score >= 0.6', () => {
      const rule = createMockRule({
        deletion_score: 0.7,
      });

      render(<RuleCard rule={rule} onToggle={mockOnToggle} showPrediction={true} />);

      expect(screen.getByText(/评分: 70%/)).toBeInTheDocument();
    });

    it('does not show prediction score when deletion_score < 0.6', () => {
      const rule = createMockRule({
        deletion_score: 0.5,
      });

      render(<RuleCard rule={rule} onToggle={mockOnToggle} showPrediction={true} />);

      expect(screen.queryByText(/评分:/)).not.toBeInTheDocument();
    });
  });

  describe('NEW Badge', () => {
    it('shows NEW badge when rule.isNew is true', () => {
      const rule = createMockRule({
        isNew: true,
      });

      render(<RuleCard rule={rule} onToggle={mockOnToggle} />);

      expect(screen.getByText('NEW')).toBeInTheDocument();
    });

    it('does not show NEW badge when rule.isNew is false', () => {
      const rule = createMockRule({
        isNew: false,
      });

      render(<RuleCard rule={rule} onToggle={mockOnToggle} />);

      expect(screen.queryByText('NEW')).not.toBeInTheDocument();
    });

    it('does not show warning badge when rule is new (even with high deletion_score)', () => {
      const rule = createMockRule({
        isNew: true,
        deletion_score: 0.9,
      });

      render(<RuleCard rule={rule} onToggle={mockOnToggle} showPrediction={true} />);

      expect(screen.getByText('NEW')).toBeInTheDocument();
      expect(screen.queryByText('高风险')).not.toBeInTheDocument();
    });
  });

  describe('Hover State', () => {
    it('changes border style on mouse enter', () => {
      const rule = createMockRule();

      const { container } = render(<RuleCard rule={rule} onToggle={mockOnToggle} />);

      const card = container.firstChild as HTMLElement;

      // Initial state
      expect(card.style.border).toContain('rgba(100, 150, 255, 0.4)');

      // Hover state
      fireEvent.mouseEnter(card);
      expect(card.style.border).toContain('rgba(100, 150, 255, 0.6)');

      // Leave state
      fireEvent.mouseLeave(card);
      expect(card.style.border).toContain('rgba(100, 150, 255, 0.4)');
    });

    it('applies glow effect on hover', () => {
      const rule = createMockRule();

      const { container } = render(<RuleCard rule={rule} onToggle={mockOnToggle} />);

      const card = container.firstChild as HTMLElement;

      // Initial state - no glow
      expect(card.style.boxShadow).toBe('none');

      // Hover state - has glow
      fireEvent.mouseEnter(card);
      expect(card.style.boxShadow).toContain('rgba(100, 150, 255, 0.3)');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty tags array', () => {
      const rule = createMockRule({
        tags: [],
      });

      render(<RuleCard rule={rule} onToggle={mockOnToggle} />);

      // Should render without errors
      expect(screen.getByText('空间法则')).toBeInTheDocument();
    });

    it('handles undefined deletion_score', () => {
      const rule = createMockRule({
        deletion_score: undefined,
      });

      render(<RuleCard rule={rule} onToggle={mockOnToggle} showPrediction={true} />);

      // Should not show any warning
      expect(screen.queryByText('高风险')).not.toBeInTheDocument();
      expect(screen.queryByText('预测')).not.toBeInTheDocument();
    });

    it('handles unknown tag IDs gracefully', () => {
      const rule = createMockRule({
        tags: ['unknown-tag-id'],
      });

      render(<RuleCard rule={rule} onToggle={mockOnToggle} />);

      // Should render without errors, unknown tag should be filtered out
      expect(screen.getByText('空间法则')).toBeInTheDocument();
    });

    it('handles very long rule text', () => {
      const longText = 'A'.repeat(1000);
      const rule = createMockRule({
        rule: longText,
      });

      render(<RuleCard rule={rule} onToggle={mockOnToggle} />);

      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    it('handles special characters in rule text', () => {
      const rule = createMockRule({
        rule: '<script>alert("xss")</script> & "quotes" \'apostrophe\'',
      });

      render(<RuleCard rule={rule} onToggle={mockOnToggle} />);

      // React should escape the content
      expect(screen.getByText(/<script>alert\("xss"\)<\/script>/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has accessible button labels', () => {
      const rule = createMockRule({ confirmed: false });

      render(
        <RuleCard rule={rule} onToggle={mockOnToggle} onDelete={mockOnDelete} />
      );

      expect(screen.getByRole('button', { name: /confirm rule/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /delete rule/i })).toBeInTheDocument();
    });

    it('has correct aria-label for confirmed state', () => {
      const rule = createMockRule({ confirmed: true });

      render(<RuleCard rule={rule} onToggle={mockOnToggle} />);

      expect(screen.getByRole('button', { name: /unconfirm rule/i })).toBeInTheDocument();
    });

    it('has correct aria-label for rejected state', () => {
      const rule = createMockRule({ rejected: true });

      render(
        <RuleCard rule={rule} onToggle={mockOnToggle} onDelete={mockOnDelete} />
      );

      expect(screen.getByRole('button', { name: /rule deleted/i })).toBeInTheDocument();
    });
  });
});
