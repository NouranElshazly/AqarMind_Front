import tkinter as tk
from tkinter import ttk, simpledialog, messagebox
import math
import time
import json
import os

EMPTY = 0
PLAYER_1 = 1 
PLAYER_2 = 2 

STATS_FILE = "connect6_stats.json"


DIFFICULTY_MAP = {
    "Very Easy": 1,
    "Easy": 2,
    "Medium": 3,
    "Hard": 4,
    "Very Hard": 5 
}

COLOR_CHOICES = ["Blue", "Red", "Green", "Yellow", "Purple", "Orange", "Black", "Pink"]


PIECE_SIZE_RATIO = 0.8  
class Connect6Game:
 
    def __init__(self, size=10):
        self.size = size
        self.board = [[EMPTY] * size for _ in range(size)]
        self.turn = PLAYER_1
        self.moves_history = []

    def make_move(self, row, col, player):
        if self.is_valid_move(row, col):
            self.board[row][col] = player
            self.moves_history.append((row, col))
            return True
        return False

    def undo_move(self):
        if not self.moves_history:
            return
        row, col = self.moves_history.pop()
        self.board[row][col] = EMPTY

    def is_valid_move(self, row, col):
        return 0 <= row < self.size and 0 <= col < self.size and self.board[row][col] == EMPTY

    def check_win(self, player):
        for r in range(self.size):
            for c in range(self.size - 5):
                if all(self.board[r][c + i] == player for i in range(6)):
                    return True
        for c in range(self.size):
            for r in range(self.size - 5):
                if all(self.board[r + i][c] == player for i in range(6)):
                    return True
        for r in range(5, self.size):
            for c in range(self.size - 5):
                if all(self.board[r - i][c + i] == player for i in range(6)):
                    return True
        for r in range(self.size - 5):
            for c in range(self.size - 5):
                if all(self.board[r + i][c + i] == player for i in range(6)):
                    return True
        return False

    def get_empty_cells(self):
        empty_cells = []
        for r in range(self.size):
            for c in range(self.size):
                if self.board[r][c] == EMPTY:
                    empty_cells.append((r, c))
        return empty_cells

    def is_board_full(self):
        return len(self.get_empty_cells()) == 0


class AIPlayer:
   
    def __init__(self, ai_piece, human_piece, depth):
        self.ai_piece = ai_piece
        self.human_piece = human_piece
        self.depth = depth

    def find_best_move(self, game):
        best_score = -math.inf
        best_move = None
        
        possible_moves = self.get_intelligent_moves(game)
        
        for move in possible_moves:
            row, col = move
            game.make_move(row, col, self.ai_piece)
            score = self.minimax(game, self.depth - 1, -math.inf, math.inf, False)
            game.undo_move()

            if score > best_score:
                best_score = score
                best_move = (row, col)
                
        if best_move is None and game.is_valid_move(game.size // 2, game.size // 2):
            return (game.size // 2, game.size // 2)
        elif best_move is None:
             return game.get_empty_cells()[0]
        return best_move

    def get_intelligent_moves(self, game):
        possible_moves = set()
        empty_cells = game.get_empty_cells()
        
        if len(empty_cells) == game.size * game.size:
            return [(game.size // 2, game.size // 2)]

        for r in range(game.size):
            for c in range(game.size):
                if game.board[r][c] != EMPTY:
                    for dr in [-1, 0, 1]:
                        for dc in [-1, 0, 1]:
                            if dr == 0 and dc == 0: continue
                            nr, nc = r + dr, c + dc
                            if game.is_valid_move(nr, nc):
                                possible_moves.add((nr, nc))
        
        return list(possible_moves) if possible_moves else empty_cells

    def minimax(self, game, depth, alpha, beta, is_maximizing_player):
      
        if game.check_win(self.ai_piece): return 10000000 + depth
        if game.check_win(self.human_piece): return -10000000 - depth
        if game.is_board_full(): return 0
        if depth == 0: return self.heuristic_evaluation(game)

        if is_maximizing_player: 
            max_eval = -math.inf
            for move in self.get_intelligent_moves(game):
                r, c = move
                game.make_move(r, c, self.ai_piece)
                eval = self.minimax(game, depth - 1, alpha, beta, False)
                game.undo_move()
                
                max_eval = max(max_eval, eval)
                alpha = max(alpha, eval)
                
                if beta <= alpha:
                    break
            return max_eval
            
        else: 
            min_eval = math.inf
            for move in self.get_intelligent_moves(game):
                r, c = move
                game.make_move(r, c, self.human_piece)
                eval = self.minimax(game, depth - 1, alpha, beta, True)
                game.undo_move()
                
                min_eval = min(min_eval, eval)
                beta = min(beta, eval)
                
                if beta <= alpha:
                    break
            return min_eval

    def heuristic_evaluation(self, game):
        score = 0
        window_length = 6
        
        for r in range(game.size):
            row_array = game.board[r]
            for c in range(game.size - window_length + 1):
                score += self.evaluate_window(row_array[c : c + window_length])
        for c in range(game.size):
            col_array = [game.board[r][c] for r in range(game.size)]
            for r in range(game.size - window_length + 1):
                score += self.evaluate_window(col_array[r : r + window_length])

        for r in range(game.size - window_length + 1):
            for c in range(game.size - window_length + 1):
                window = [game.board[r + i][c + i] for i in range(window_length)]
                score += self.evaluate_window(window)
        for r in range(window_length - 1, game.size):
            for c in range(game.size - window_length + 1):
                window = [game.board[r - i][c + i] for i in range(window_length)]
                score += self.evaluate_window(window)
                
        return score

    def evaluate_window(self, window):
        score = 0
        ai_count = window.count(self.ai_piece)
        human_count = window.count(self.human_piece)
        empty_count = window.count(EMPTY)

        if ai_count == 5 and empty_count == 1: score += 500000
        elif ai_count == 4 and empty_count == 2: score += 5000
        elif ai_count == 3 and empty_count == 3: score += 500
        elif ai_count == 2 and empty_count == 4: score += 50

        if human_count == 5 and empty_count == 1: score -= 1000000
        elif human_count == 4 and empty_count == 2: score -= 10000
        elif human_count == 3 and empty_count == 3: score -= 1000
            
        return score


class Connect6App(tk.Tk):
    
    def __init__(self):
        super().__init__()
        self.title("Intelligent Connect-6 AI Player (v3.0)")
        self.geometry("700x850") 
        
        self.BOARD_COLOR = "#004080"
        self.EMPTY_COLOR = "#FFFFFF"
        self.HEADER_FONT = ("Arial", 18, "bold")
        self.DEFAULT_FONT = ("Arial", 12)
        
        style = ttk.Style(self)
        style.configure("TFrame", background="#f0f0f0")
        style.configure("TLabel", background="#f0f0f0", font=self.DEFAULT_FONT)
        style.configure("Header.TLabel", font=self.HEADER_FONT)
        style.configure("TButton", font=self.DEFAULT_FONT)
        style.configure("TRadiobutton", background="#f0f0f0", font=self.DEFAULT_FONT)
        style.configure("TLabelframe", background="#f0f0f0", font=self.DEFAULT_FONT)
        style.configure("TLabelframe.Label", background="#f0f0f0", font=self.DEFAULT_FONT)
        
        self.game = None
        self.ai_player = None
        self.cell_size = 0
        self.game_over = False
        
        self.board_size = 10
        self.ai_depth = 3
        self.game_mode = tk.StringVar(value="PVA") 
        
        self.difficulty_var = tk.StringVar(value="Medium")
        
        self.player1_color = "Blue"
        self.player2_color = "Red"
        self.p1_color_var = tk.StringVar(value=self.player1_color)
        self.p2_color_var = tk.StringVar(value=self.player2_color)
        
        self.start_time = None
        self.timer_running = False
        
        self.create_setup_frame()
        self.create_game_frame()
        self.show_setup_frame()

    def create_setup_frame(self):
        self.setup_frame = ttk.Frame(self, padding="20 20 20 20")
        
        ttk.Label(self.setup_frame, text="Connect-6 AI Settings", style="Header.TLabel").pack(pady=20)
        
        mode_frame = ttk.Frame(self.setup_frame)
        ttk.Label(mode_frame, text="Game Mode:", font=self.DEFAULT_FONT).pack(side=tk.LEFT, padx=5)
        ttk.Radiobutton(mode_frame, text="Player vs. AI", variable=self.game_mode, value="PVA", command=self.toggle_ai_settings).pack(side=tk.LEFT, padx=10)
        ttk.Radiobutton(mode_frame, text="Player vs. Player", variable=self.game_mode, value="PVP", command=self.toggle_ai_settings).pack(side=tk.LEFT, padx=10)
        mode_frame.pack(pady=10)

        size_frame = ttk.Frame(self.setup_frame)
        ttk.Label(size_frame, text="Board Size (N x N):").pack(side=tk.LEFT, padx=5)
        self.size_var = tk.StringVar(value=str(self.board_size))
        ttk.Entry(size_frame, textvariable=self.size_var, font=self.DEFAULT_FONT, width=5).pack(side=tk.LEFT)
        size_frame.pack(pady=10)
        
        color_frame = ttk.LabelFrame(self.setup_frame, text="Color Settings", padding="10 10 10 10")
        ttk.Label(color_frame, text="Player 1 Color:").grid(row=0, column=0, sticky=tk.W, padx=5, pady=5)
        ttk.OptionMenu(color_frame, self.p1_color_var, self.player1_color, *COLOR_CHOICES).grid(row=0, column=1, sticky=tk.W, padx=5)
        ttk.Label(color_frame, text="Player 2 / AI Color:").grid(row=1, column=0, sticky=tk.W, padx=5, pady=5)
        ttk.OptionMenu(color_frame, self.p2_color_var, self.player2_color, *COLOR_CHOICES).grid(row=1, column=1, sticky=tk.W, padx=5)
        color_frame.pack(pady=10, fill=tk.X, padx=20)


        self.ai_settings_frame = ttk.LabelFrame(self.setup_frame, text="AI Settings", padding="10 10 10 10")
        
        depth_frame = ttk.Frame(self.ai_settings_frame)
        ttk.Label(depth_frame, text="AI Difficulty:").pack(side=tk.LEFT, padx=5)
        difficulty_options = list(DIFFICULTY_MAP.keys())
        ttk.OptionMenu(depth_frame, self.difficulty_var, "Medium", *difficulty_options).pack(side=tk.LEFT)
        depth_frame.pack(pady=10, padx=10)
        
        self.ai_settings_frame.pack(pady=10, fill=tk.X, padx=20)
        
        button_frame = ttk.Frame(self.setup_frame)
        ttk.Button(button_frame, text="Start Game", command=self.start_game).pack(fill=tk.X, pady=5)
        ttk.Button(button_frame, text="Show Statistics", command=self.show_stats).pack(fill=tk.X, pady=5)
        button_frame.pack(pady=20, fill=tk.X, padx=20)
        
        self.toggle_ai_settings()

    def create_game_frame(self):
        self.game_frame = ttk.Frame(self, padding="10 10 10 10")
        
        info_frame = ttk.Frame(self.game_frame)
        self.status_label = ttk.Label(info_frame, text="Welcome!", font=("Arial", 16), anchor=tk.W)
        self.status_label.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=10)
        
        self.timer_label = ttk.Label(info_frame, text="Time: 0s", font=("Arial", 16, "bold"), anchor=tk.E)
        self.timer_label.pack(side=tk.RIGHT, padx=10)
        info_frame.pack(fill=tk.X, pady=10)
        
        self.canvas = tk.Canvas(self.game_frame, width=600, height=600, bg=self.BOARD_COLOR)
        self.canvas.pack()
        self.canvas.bind("<Button-1>", self.on_board_click)
        
        control_frame = ttk.Frame(self.game_frame)
        ttk.Button(control_frame, text="Restart Game", command=self.restart_current_game).pack(side=tk.LEFT, expand=True, padx=10, pady=15)
        ttk.Button(control_frame, text="Back to Menu", command=self.reset_to_setup).pack(side=tk.LEFT, expand=True, padx=10, pady=15)
        control_frame.pack(fill=tk.X)

    def show_setup_frame(self):
        self.game_frame.pack_forget()
        self.setup_frame.pack(expand=True, fill=tk.BOTH)
        
    def show_game_frame(self):
        self.setup_frame.pack_forget()
        self.game_frame.pack(expand=True, fill=tk.BOTH)

    def toggle_ai_settings(self):
        if self.game_mode.get() == "PVA":
            for child in self.ai_settings_frame.winfo_children():
                child.state(['!disabled'])
        else: 
            for child in self.ai_settings_frame.winfo_children():
                child.state(['disabled'])

    def start_game(self):
        try:
            self.board_size = int(self.size_var.get())
            self.ai_depth = DIFFICULTY_MAP[self.difficulty_var.get()]
            
            self.player1_color = self.p1_color_var.get()
            self.player2_color = self.p2_color_var.get()
            
            if self.player1_color == self.player2_color:
                messagebox.showerror("Color Error", "Player 1 and Player 2 cannot have the same color. Please choose different colors.")
                return

            if not (6 <= self.board_size <= 20):
                messagebox.showerror("Error", "Board size must be between 6 and 20.")
                return
            
            show_warning = False
            warning_message = "Performance Warning:\n\n"
            
            if self.board_size >= 15:
                warning_message += "• A board size of 15x15 or larger may feel slow.\n"
                show_warning = True
            
            if self.ai_depth >= 5:
                warning_message += f"• The '{self.difficulty_var.get()}' difficulty (Depth {self.ai_depth}) will be VERY slow.\nThe AI may take several seconds or minutes per move."
                show_warning = True
            
            if show_warning:
                if not messagebox.askyesno("Confirm Settings", warning_message + "\n\nDo you want to continue?"):
                    return 
            
            self.restart_current_game()
            self.show_game_frame()
            
        except ValueError:
            messagebox.showerror("Error", "Please enter a valid number for board size.")
            
    def restart_current_game(self):
        """Resets the current game to its initial state."""
        self.game = Connect6Game(self.board_size)
        self.ai_player = None
        self.game_over = False
        
        if self.game_mode.get() == "PVA":
            self.ai_player = AIPlayer(PLAYER_2, PLAYER_1, self.ai_depth)
        
        self.cell_size = 600 // self.board_size
        canvas_size = self.board_size * self.cell_size
        self.canvas.config(width=canvas_size, height=canvas_size)
        
        self.draw_board()
        self.status_label.config(text=f"Player 1's Turn ({self.player1_color.capitalize()})")
        
        self.start_time = time.time()
        self.timer_running = True
        self.update_timer()

    def reset_to_setup(self):
        self.game_over = True
        self.timer_running = False
        self.show_setup_frame()

    def update_timer(self):
        if self.timer_running:
            elapsed_time = int(time.time() - self.start_time)
            self.timer_label.config(text=f"Time: {elapsed_time}s")
            self.after(1000, self.update_timer)

    def draw_board(self):
        self.canvas.delete("all")
        padding = self.cell_size * (1 - PIECE_SIZE_RATIO) / 2
        
        for r in range(self.board_size):
            for c in range(self.board_size):
                x0 = c * self.cell_size + padding
                y0 = r * self.cell_size + padding
                x1 = (c + 1) * self.cell_size - padding
                y1 = (r + 1) * self.cell_size - padding
                
                if self.game.board[r][c] == PLAYER_1:
                    color = self.player1_color
                elif self.game.board[r][c] == PLAYER_2:
                    color = self.player2_color
                else:
                    color = self.EMPTY_COLOR
                
                self.canvas.create_oval(x0, y0, x1, y1, fill=color, outline="black", width=1)

    def on_board_click(self, event):
        if self.game_over: return

        col = event.x // self.cell_size
        row = event.y // self.cell_size

        current_player = self.game.turn
        if not self.game.is_valid_move(row, col):
            return 
        
        if self.game_mode.get() == "PVA" and current_player != PLAYER_1:
            return 
            
        self.game.make_move(row, col, current_player)
        self.draw_board()
        
        winner_name = "Player 1" if current_player == PLAYER_1 else "Player 2"
        if self.game.check_win(current_player):
            self.end_game(f"{winner_name} Wins!", winner_player=current_player)
            return
        if self.game.is_board_full():
            self.end_game("It's a Draw!", winner_player=None)
            return
            
        if self.game_mode.get() == "PVP":
            if self.game.turn == PLAYER_1:
                self.game.turn = PLAYER_2
                self.status_label.config(text=f"Player 2's Turn ({self.player2_color.capitalize()})")
            else:
                self.game.turn = PLAYER_1
                self.status_label.config(text=f"Player 1's Turn ({self.player1_color.capitalize()})")
        
        else:
            self.game.turn = PLAYER_2
            self.status_label.config(text="AI is thinking...")
            self.update_idletasks()
            self.after(100, self.ai_move)

    def ai_move(self):
        if self.game_over: return
            
        move = self.ai_player.find_best_move(self.game)
        
        if move is None:
            if self.game.is_board_full(): self.end_game("It's a Draw!", winner_player=None)
            return

        row, col = move
        self.game.make_move(row, col, PLAYER_2)
        self.draw_board()

        if self.game.check_win(PLAYER_2):
            self.end_game("AI Wins. Better luck next time!", winner_player=PLAYER_2)
            return
        if self.game.is_board_full():
            self.end_game("It's a Draw!", winner_player=None)
            return
            
        self.game.turn = PLAYER_1
        self.status_label.config(text=f"Player 1's Turn ({self.player1_color.capitalize()})")

    def end_game(self, message, winner_player):
        self.game_over = True
        self.timer_running = False
        self.status_label.config(text=message)
        self.update_stats(winner_player)
        messagebox.showinfo("Game Over", message)

    def get_default_stats(self):
        return {"pva_human_wins": 0, "pva_ai_wins": 0, "pva_draws": 0, "pvp_p1_wins": 0, "pvp_p2_wins": 0, "pvp_draws": 0}
    def load_stats(self):
        if not os.path.exists(STATS_FILE): return self.get_default_stats()
        try:
            with open(STATS_FILE, 'r') as f:
                stats = json.load(f)
                for key, value in self.get_default_stats().items():
                    if key not in stats: stats[key] = value
                return stats
        except json.JSONDecodeError: return self.get_default_stats()
    def save_stats(self, stats):
        try:
            with open(STATS_FILE, 'w') as f:
                json.dump(stats, f, indent=4)
        except IOError as e:
            print(f"Error saving stats: {e}")
    def update_stats(self, winner_player):
        stats = self.load_stats()
        if self.game_mode.get() == "PVA":
            if winner_player == PLAYER_1: stats["pva_human_wins"] += 1
            elif winner_player == PLAYER_2: stats["pva_ai_wins"] += 1
            else: stats["pva_draws"] += 1
        elif self.game_mode.get() == "PVP":
            if winner_player == PLAYER_1: stats["pvp_p1_wins"] += 1
            elif winner_player == PLAYER_2: stats["pvp_p2_wins"] += 1
            else: stats["pvp_draws"] += 1
        self.save_stats(stats)
    def show_stats(self):
        stats = self.load_stats()
        stats_message = (
            "--- Player vs. AI Stats ---\n"
            f"Human Wins: {stats['pva_human_wins']}\n"
            f"AI Wins: {stats['pva_ai_wins']}\n"
            f"Draws: {stats['pva_draws']}\n"
            "\n"
            "--- Player vs. Player Stats ---\n"
            f"Player 1 Wins: {stats['pvp_p1_wins']}\n"
            f"Player 2 Wins: {stats['pvp_p2_wins']}\n"
            f"Draws: {stats['pvp_draws']}\n"
        )
        messagebox.showinfo("Game Statistics", stats_message)


if __name__ == "__main__":
    app = Connect6App()
    app.mainloop()