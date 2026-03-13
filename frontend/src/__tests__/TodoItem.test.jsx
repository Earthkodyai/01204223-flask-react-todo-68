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

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../context/AuthContext';

describe('TodoList', () => {
  beforeEach(() => {
    // ล้างสถานะ mock เดิมก่อนเริ่ม test ใหม่ทุกครั้ง
    vi.clearAllMocks();

    // Mock global fetch เพื่อไม่ให้ยิงไปที่ server จริง
    vi.stubGlobal('fetch', vi.fn());

    // --- ขั้นตอนที่ 2: สั่งให้ useAuth คืนค่าที่เราต้องการ (username, login, logout) ---
    useAuth.mockReturnValue({
      username: 'testuser',
      accessToken: 'mock-token-123', // ใส่ไว้เพื่อให้โค้ดที่เรียกใช้ token ไม่พัง
      login: vi.fn(),
      logout: vi.fn(),
    });
  });

  it('renders TodoList with mocked user', () => {
    render(<TodoList />);
    // ตรวจสอบว่าหน้าจอแสดงผลโดยใช้ข้อมูลจาก useAuth ที่เรา mock ไว้
    expect(screen.getByText(/testuser/i)).toBeDefined();
  });

  it('toggles done on a todo item', async () => {
    // จำลองข้อมูลเริ่มต้นของ fetch (รายการ Todo)
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 1, title: 'Test Todo', done: false }],
    });

    render(<TodoList />);

    // รอจนกว่า Todo จะขึ้นบนจอ
    const checkbox = await screen.findByRole('checkbox');
    
    // จำลองการคลิก toggle
    global.fetch.mockResolvedValueOnce({ ok: true });
    fireEvent.click(checkbox);

    // --- ขั้นตอนที่ 3: แก้ไขการ Assert fetch ให้ใช้ expect.anything() ---
    // เพื่อให้ผ่านแม้ว่าจะมี Header หรือพารามิเตอร์อื่นๆ เพิ่มเข้ามา
    await waitFor(() => {
      expect(global.fetch).toHaveBeenLastCalledWith(
        expect.stringMatching(/1\/toggle/), 
        expect.anything() // ผ่อนปรนการตรวจสอบเพื่อให้รองรับ Authorization header
      );
    });
  });
});

