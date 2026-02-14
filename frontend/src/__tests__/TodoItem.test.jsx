import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect } from 'vitest'
import TodoItem from '../TodoItem.jsx'

const baseTodo = {             // ** TodoItem พื้นฐานสำหรับทดสอบ
  id: 1,
  title: 'Sample Todo',
  done: false,
  comments: [],
};

describe('TodoItem', () => {
  it('renders with no comments correctly', () => {
    render(
      <TodoItem todo={baseTodo} />
    );
    expect(screen.getByText('Sample Todo')).toBeInTheDocument();
    expect(screen.getByText('No comments')).toBeInTheDocument();
  });
  it('does not show no comments message when it has a comment', () => {
    const todoWithComment = {
      ...baseTodo,
      comments: [
        {id: 1, message: 'First comment'},
      ]
    };
    render(
      <TodoItem todo={todoWithComment} />
    );
    expect(screen.queryByText('No comments')).not.toBeInTheDocument();
  });
  it('renders with comments correctly', () => {
  const todoWithComment = {
    ...baseTodo,
    comments: [
      {id: 1, message: 'First comment'},
      {id: 2, message: 'Another comment'},
    ]
  };
  render(
    <TodoItem todo={todoWithComment} />
  );
  expect(screen.getByText('Sample Todo')).toBeInTheDocument();
  expect(screen.getByText('First comment')).toBeInTheDocument();
  expect(screen.getByText('Another comment')).toBeInTheDocument();
  expect(screen.getByText(/2/)).toBeInTheDocument();
  });
  it('makes callback to toggleDone when Toggle button is clicked', () => {
    const onToggleDone = vi.fn();
    render(
      <TodoItem 
       todo={baseTodo} 
       toggleDone={onToggleDone} />
    );
    const button = screen.getByRole('button', { name: /toggle/i });
    button.click();
    expect(onToggleDone).toHaveBeenCalledWith(baseTodo.id);
  });
  it('makes callback to deleteTodo when delete button is clicked', () => {
    // 1. สร้าง Spy function สำหรับ callback
    const deleteTodoSpy = vi.fn();

    // 2. Render Component โดยส่ง Spy function เข้าไป
    render(
      <TodoItem 
        todo={baseTodo} 
        deleteTodo={deleteTodoSpy} 
      />
    );

    // 3. หาปุ่มที่มีข้อความ ❌ (ตามที่เขียนไว้ใน TodoItem.jsx)
    const deleteButton = screen.getByText('❌');

    // 4. จำลองการคลิกปุ่ม
    fireEvent.click(deleteButton);

    // 5. ตรวจสอบ (Assertion) ว่าฟังก์ชันถูกเรียกด้วย ID ที่ถูกต้องหรือไม่
    expect(deleteTodoSpy).toHaveBeenCalledWith(baseTodo.id);
  });
  it('makes callback to addNewComment when a new comment is added', async () => {
    const onAddNewComment = vi.fn();
    
    render(
      <TodoItem 
        todo={baseTodo} 
        addNewComment={onAddNewComment} 
      />
    );

    // พิมพ์ข้อความลงใน textbox
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'New comment');

    // กดปุ่ม
    const button = screen.getByRole('button', { name: /add comment/i });
    fireEvent.click(button);

    // assert
    expect(onAddNewComment).toHaveBeenCalledWith(baseTodo.id, 'New comment');
  });
});

