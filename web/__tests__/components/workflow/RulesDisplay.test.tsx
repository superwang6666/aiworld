import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { WorldRule, RuleTag } from '@/types';

import RulesDisplay from '@/components/workflow/RulesDisplay';

// Mock child components
jest.mock('@/components/common/CommonHeader', () => {
  return function MockCommonHeader() {
    return <div data-testid="common-header">CommonHeader</div>;
  };
});

jest.mock('@/components/workflow/WorkflowFooter', () => {
  return function MockWorkflowFooter() {
    return <div data-testid="workflow-footer">WorkflowFooter</div>;
  };
});

jest.mock('@/components/RuleCard', () => {
  return function MockRuleCard({
    rule,
    onToggle,
    onDelete,
  }: {
    rule: WorldRule;
    onToggle: (id: string) => void;
    onDelete?: (id: string) => void;
  }) {
    return (
      <div data-testid={`rule-card-${rule.id}`}>
        <span>{rule.rule}</span>
        <button onClick={() => onToggle(rule.id)}>Toggle</button>
        {onDelete && <button onClick={() => onDelete(rule.id)}>Delete</button>}
      </div>
    );
  };
});

describe('RulesDisplay', () => {
  // Test data factory
  const createMockRule = (overrides: Partial<WorldRule> = {}): WorldRule => ({
    id: 'test-rule-1',
    law: 'Space',
    rule: 'Test rule content',
    expert_logic: 'Test expert logic',
    confirmed: false,
    tags: [],
    discipline_codes: [],
    rejected: false,
    created_at: new Date().toISOString(),
    ...overrides,
  });

  const createMockTagWeights = (): Record<string, RuleTag> => ({
    'tag-1': {
      id: 'tag-1',
      name: 'Test Tag',
      category: 'tone',
      weight: 0.5,
      usage_count: 0,
      deletion_count: 0,
      source: 'predefined',
    },
  });

  const defaultProps = {
    rules: [] as WorldRule[],
    tagWeights: createMockTagWeights(),
    archiveName: '',
    confirmedCount: 0,
    onToggleRule: jest.fn(),
    onDeleteRule: jest.fn(),
    onArchiveNameChange: jest.fn(),
    onSaveArchive: jest.fn(),
    onShowArchiveManager: jest.fn(),
    onExport: jest.fn(),
    onReset: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders CommonHeader component', () => {
      render(<RulesDisplay {...defaultProps} />);

      expect(screen.getByTestId('common-header')).toBeInTheDocument();
    });

    it('renders WorkflowFooter component', () => {
      render(<RulesDisplay {...defaultProps} />);

      expect(screen.getByTestId('workflow-footer')).toBeInTheDocument();
    });

    it('renders page title', () => {
      render(<RulesDisplay {...defaultProps} />);

      expect(screen.getByText('世界规则')).toBeInTheDocument();
      expect(screen.getByText('World Rules Generation System')).toBeInTheDocument();
    });
  });

  describe('Statistics Display', () => {
    it('displays total rules count', () => {
      const rules = [
        createMockRule({ id: '1' }),
        createMockRule({ id: '2' }),
        createMockRule({ id: '3' }),
      ];

      render(<RulesDisplay {...defaultProps} rules={rules} />);

      expect(screen.getByText('已生成规则:')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('displays confirmed count', () => {
      const rules = [
        createMockRule({ id: '1', confirmed: true }),
        createMockRule({ id: '2', confirmed: true }),
        createMockRule({ id: '3', confirmed: false }),
      ];

      render(<RulesDisplay {...defaultProps} rules={rules} confirmedCount={2} />);

      expect(screen.getByText('已确认:')).toBeInTheDocument();
      expect(screen.getByText('2/3')).toBeInTheDocument();
    });

    it('displays zero counts correctly', () => {
      render(<RulesDisplay {...defaultProps} rules={[]} confirmedCount={0} />);

      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('0/0')).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('renders archive manager button', () => {
      render(<RulesDisplay {...defaultProps} />);

      expect(screen.getByText('存档管理')).toBeInTheDocument();
    });

    it('calls onShowArchiveManager when archive button is clicked', async () => {
      const user = userEvent.setup();
      const onShowArchiveManager = jest.fn();

      render(
        <RulesDisplay {...defaultProps} onShowArchiveManager={onShowArchiveManager} />
      );

      await user.click(screen.getByText('存档管理'));

      expect(onShowArchiveManager).toHaveBeenCalledTimes(1);
    });

    it('renders reset button', () => {
      render(<RulesDisplay {...defaultProps} />);

      // There are two reset buttons - one in header, one in empty state
      const resetButtons = screen.getAllByText('重新开始');
      expect(resetButtons.length).toBeGreaterThanOrEqual(1);
    });

    it('calls onReset when reset button is clicked', async () => {
      const user = userEvent.setup();
      const onReset = jest.fn();

      render(<RulesDisplay {...defaultProps} onReset={onReset} />);

      // There are two "重新开始" buttons - one in header, one in empty state
      const resetButtons = screen.getAllByText('重新开始');
      await user.click(resetButtons[0]);

      expect(onReset).toHaveBeenCalledTimes(1);
    });

    it('renders export button with confirmed count', () => {
      render(<RulesDisplay {...defaultProps} confirmedCount={5} />);

      expect(screen.getByText(/导出已确认 \(5\)/)).toBeInTheDocument();
    });

    it('disables export button when no rules are confirmed', () => {
      render(<RulesDisplay {...defaultProps} confirmedCount={0} />);

      const exportButton = screen.getByText(/导出已确认 \(0\)/);
      expect(exportButton).toBeDisabled();
    });

    it('enables export button when rules are confirmed', () => {
      render(<RulesDisplay {...defaultProps} confirmedCount={3} />);

      const exportButton = screen.getByText(/导出已确认 \(3\)/);
      expect(exportButton).not.toBeDisabled();
    });

    it('calls onExport when export button is clicked', async () => {
      const user = userEvent.setup();
      const onExport = jest.fn();

      render(
        <RulesDisplay {...defaultProps} confirmedCount={1} onExport={onExport} />
      );

      await user.click(screen.getByText(/导出已确认/));

      expect(onExport).toHaveBeenCalledTimes(1);
    });
  });

  describe('Archive Save Section', () => {
    it('shows archive save section when rules exist', () => {
      const rules = [createMockRule()];

      render(<RulesDisplay {...defaultProps} rules={rules} />);

      expect(screen.getByText('保存世界存档')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('输入存档名称...')).toBeInTheDocument();
    });

    it('hides archive save section when no rules exist', () => {
      render(<RulesDisplay {...defaultProps} rules={[]} />);

      expect(screen.queryByText('保存世界存档')).not.toBeInTheDocument();
    });

    it('displays current archive name in input', () => {
      const rules = [createMockRule()];

      render(
        <RulesDisplay {...defaultProps} rules={rules} archiveName="My World" />
      );

      const input = screen.getByPlaceholderText('输入存档名称...');
      expect(input).toHaveValue('My World');
    });

    it('calls onArchiveNameChange when input changes', async () => {
      const user = userEvent.setup();
      const onArchiveNameChange = jest.fn();
      const rules = [createMockRule()];

      render(
        <RulesDisplay
          {...defaultProps}
          rules={rules}
          onArchiveNameChange={onArchiveNameChange}
        />
      );

      const input = screen.getByPlaceholderText('输入存档名称...');
      await user.type(input, 'New Name');

      expect(onArchiveNameChange).toHaveBeenCalled();
    });

    it('disables save button when archive name is empty', () => {
      const rules = [createMockRule()];

      render(<RulesDisplay {...defaultProps} rules={rules} archiveName="" />);

      const saveButton = screen.getByText('保存存档');
      expect(saveButton).toBeDisabled();
    });

    it('disables save button when archive name is whitespace only', () => {
      const rules = [createMockRule()];

      render(<RulesDisplay {...defaultProps} rules={rules} archiveName="   " />);

      const saveButton = screen.getByText('保存存档');
      expect(saveButton).toBeDisabled();
    });

    it('enables save button when archive name is provided', () => {
      const rules = [createMockRule()];

      render(
        <RulesDisplay {...defaultProps} rules={rules} archiveName="Valid Name" />
      );

      const saveButton = screen.getByText('保存存档');
      expect(saveButton).not.toBeDisabled();
    });

    it('calls onSaveArchive when save button is clicked', async () => {
      const user = userEvent.setup();
      const onSaveArchive = jest.fn();
      const rules = [createMockRule()];

      render(
        <RulesDisplay
          {...defaultProps}
          rules={rules}
          archiveName="My Archive"
          onSaveArchive={onSaveArchive}
        />
      );

      await user.click(screen.getByText('保存存档'));

      expect(onSaveArchive).toHaveBeenCalledTimes(1);
    });

    it('displays helper text', () => {
      const rules = [createMockRule()];

      render(<RulesDisplay {...defaultProps} rules={rules} />);

      expect(
        screen.getByText('存档将包含所有规则、标签权重和偏好设置')
      ).toBeInTheDocument();
    });
  });

  describe('Rules List', () => {
    it('renders rule cards for each rule', () => {
      const rules = [
        createMockRule({ id: 'rule-1', rule: 'Rule One' }),
        createMockRule({ id: 'rule-2', rule: 'Rule Two' }),
        createMockRule({ id: 'rule-3', rule: 'Rule Three' }),
      ];

      render(<RulesDisplay {...defaultProps} rules={rules} />);

      expect(screen.getByTestId('rule-card-rule-1')).toBeInTheDocument();
      expect(screen.getByTestId('rule-card-rule-2')).toBeInTheDocument();
      expect(screen.getByTestId('rule-card-rule-3')).toBeInTheDocument();
    });

    it('passes correct props to RuleCard', () => {
      const rules = [createMockRule({ id: 'rule-1', rule: 'Test Rule Content' })];

      render(<RulesDisplay {...defaultProps} rules={rules} />);

      expect(screen.getByText('Test Rule Content')).toBeInTheDocument();
    });

    it('calls onToggleRule when rule toggle is clicked', async () => {
      const user = userEvent.setup();
      const onToggleRule = jest.fn();
      const rules = [createMockRule({ id: 'rule-1' })];

      render(
        <RulesDisplay {...defaultProps} rules={rules} onToggleRule={onToggleRule} />
      );

      await user.click(screen.getByText('Toggle'));

      expect(onToggleRule).toHaveBeenCalledWith('rule-1');
    });

    it('calls onDeleteRule when rule delete is clicked', async () => {
      const user = userEvent.setup();
      const onDeleteRule = jest.fn();
      const rules = [createMockRule({ id: 'rule-1' })];

      render(
        <RulesDisplay {...defaultProps} rules={rules} onDeleteRule={onDeleteRule} />
      );

      await user.click(screen.getByText('Delete'));

      expect(onDeleteRule).toHaveBeenCalledWith('rule-1');
    });
  });

  describe('Empty State', () => {
    it('shows empty state when no rules exist', () => {
      render(<RulesDisplay {...defaultProps} rules={[]} />);

      expect(screen.getByText('暂无生成的规则')).toBeInTheDocument();
    });

    it('shows reset button in empty state', () => {
      render(<RulesDisplay {...defaultProps} rules={[]} />);

      // Find the reset button in the empty state section
      const emptyStateSection = screen.getByText('暂无生成的规则').closest('div');
      const resetButton = within(emptyStateSection as HTMLElement).getByText('重新开始');

      expect(resetButton).toBeInTheDocument();
    });

    it('calls onReset when empty state reset button is clicked', async () => {
      const user = userEvent.setup();
      const onReset = jest.fn();

      render(<RulesDisplay {...defaultProps} rules={[]} onReset={onReset} />);

      // Find the reset button in the empty state section
      const emptyStateSection = screen.getByText('暂无生成的规则').closest('div');
      const resetButton = within(emptyStateSection as HTMLElement).getByText('重新开始');

      await user.click(resetButton);

      expect(onReset).toHaveBeenCalledTimes(1);
    });

    it('does not show rules grid when empty', () => {
      render(<RulesDisplay {...defaultProps} rules={[]} />);

      expect(screen.queryByTestId(/rule-card-/)).not.toBeInTheDocument();
    });
  });

  describe('Grid Layout', () => {
    it('renders rules in a grid container', () => {
      const rules = [
        createMockRule({ id: '1' }),
        createMockRule({ id: '2' }),
      ];

      const { container } = render(<RulesDisplay {...defaultProps} rules={rules} />);

      // Check for grid class
      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles large number of rules', () => {
      const rules = Array.from({ length: 100 }, (_, i) =>
        createMockRule({ id: `rule-${i}`, rule: `Rule ${i}` })
      );

      render(<RulesDisplay {...defaultProps} rules={rules} />);

      // Should render all rules
      expect(screen.getByText('100')).toBeInTheDocument();
    });

    it('handles rules with special characters', () => {
      const rules = [
        createMockRule({
          id: 'special',
          rule: '<script>alert("xss")</script>',
        }),
      ];

      render(<RulesDisplay {...defaultProps} rules={rules} />);

      expect(screen.getByTestId('rule-card-special')).toBeInTheDocument();
    });

    it('handles empty tagWeights', () => {
      const rules = [createMockRule()];

      render(<RulesDisplay {...defaultProps} rules={rules} tagWeights={{}} />);

      expect(screen.getByTestId('rule-card-test-rule-1')).toBeInTheDocument();
    });

    it('handles very long archive name', async () => {
      const onArchiveNameChange = jest.fn();
      const rules = [createMockRule()];
      const longName = 'A'.repeat(500);

      render(
        <RulesDisplay
          {...defaultProps}
          rules={rules}
          archiveName={longName}
          onArchiveNameChange={onArchiveNameChange}
        />
      );

      const input = screen.getByPlaceholderText('输入存档名称...');
      expect(input).toHaveValue(longName);
    });
  });

  describe('Accessibility', () => {
    it('has accessible heading structure', () => {
      render(<RulesDisplay {...defaultProps} />);

      expect(screen.getByRole('heading', { name: '世界规则' })).toBeInTheDocument();
    });

    it('has accessible input label via placeholder', () => {
      const rules = [createMockRule()];

      render(<RulesDisplay {...defaultProps} rules={rules} />);

      expect(screen.getByPlaceholderText('输入存档名称...')).toBeInTheDocument();
    });

    it('buttons are keyboard accessible', async () => {
      const user = userEvent.setup();
      const onShowArchiveManager = jest.fn();

      render(
        <RulesDisplay {...defaultProps} onShowArchiveManager={onShowArchiveManager} />
      );

      // Tab to archive manager button and press Enter
      const archiveButton = screen.getByText('存档管理');
      archiveButton.focus();
      await user.keyboard('{Enter}');

      expect(onShowArchiveManager).toHaveBeenCalled();
    });
  });

  describe('Integration with Props', () => {
    it('updates when rules prop changes', () => {
      const { rerender } = render(
        <RulesDisplay {...defaultProps} rules={[]} />
      );

      expect(screen.getByText('暂无生成的规则')).toBeInTheDocument();

      const newRules = [createMockRule({ id: 'new-rule' })];
      rerender(<RulesDisplay {...defaultProps} rules={newRules} />);

      expect(screen.queryByText('暂无生成的规则')).not.toBeInTheDocument();
      expect(screen.getByTestId('rule-card-new-rule')).toBeInTheDocument();
    });

    it('updates confirmed count display when prop changes', () => {
      const rules = [createMockRule(), createMockRule({ id: '2' })];

      const { rerender } = render(
        <RulesDisplay {...defaultProps} rules={rules} confirmedCount={0} />
      );

      expect(screen.getByText('0/2')).toBeInTheDocument();

      rerender(
        <RulesDisplay {...defaultProps} rules={rules} confirmedCount={2} />
      );

      expect(screen.getByText('2/2')).toBeInTheDocument();
    });
  });
});
