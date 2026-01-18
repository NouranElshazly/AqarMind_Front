import tkinter as tk
from tkinter import ttk, messagebox
import networkx as nx
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
import matplotlib.colors as mcolors
import random
import time
import itertools


class BacktrackingSolver:
    def __init__(self, graph, num_colors):
        self.graph = graph
        self.num_colors = num_colors
        self.nodes = list(graph.nodes())
        self.num_nodes = len(self.nodes)
        self.colors = {}
        self.start_time = 0
        self.end_time = 0

    def solve(self):
        self.start_time = time.time()
        ok = self._solve_recursive(0)
        self.end_time = time.time()
        if ok:
            return self.colors, self.get_elapsed_time(), self.get_conflicts()
        return None, self.get_elapsed_time(), -1

    def _is_safe(self, node, color):
        for neighbor in self.graph.neighbors(node):
            if neighbor in self.colors and self.colors[neighbor] == color:
                return False
        return True

    def _solve_recursive(self, idx):
        if idx == self.num_nodes:
            return True
        node = self.nodes[idx]
        for c in range(1, self.num_colors + 1):
            if self._is_safe(node, c):
                self.colors[node] = c
                if self._solve_recursive(idx + 1):
                    return True
                del self.colors[node]
        return False

    def get_elapsed_time(self):
        return self.end_time - self.start_time

    def get_conflicts(self):
        conflicts = 0
        if self.colors:
            for u, v in self.graph.edges():
                if self.colors.get(u) == self.colors.get(v):
                    conflicts += 1
        return conflicts


class GeneticAlgorithmSolver:
    def __init__(self, graph, num_colors, population_size=100, mutation_rate=0.1, generations=200,
                 selection='tournament', crossover='uniform', mutation_op='random', elitism=True):
        self.graph = graph
        self.nodes = list(graph.nodes())
        self.num_nodes = len(self.nodes)
        self.num_colors = num_colors
        self.population_size = population_size
        self.mutation_rate = mutation_rate
        self.generations = generations
        self.selection = selection
        self.crossover = crossover
        self.mutation_op = mutation_op
        self.elitism = elitism

        self.population = []
        self.start_time = 0
        self.end_time = 0
        self.fitness_history = []

    def _create_individual(self):
        return {node: random.randint(1, self.num_colors) for node in self.nodes}

    def _fitness(self, individual):
        conflicts = 0
        for u, v in self.graph.edges():
            if individual.get(u) == individual.get(v):
                conflicts += 1
        return conflicts

    def _tournament_selection(self, ranked):
        winners = []
        k = max(2, int(0.1 * self.population_size))
        for _ in range(self.population_size):
            contestants = random.sample(ranked, k)
            winners.append(min(contestants, key=lambda ind_fit: ind_fit[1]))
        return [ind for ind, fit in winners]

    def _roulette_selection(self, ranked):
        scores = [1.0 / (1 + fit) for ind, fit in ranked]
        total = sum(scores)
        probs = [s / total for s in scores]
        selected = []
        inds = [ind for ind, fit in ranked]
        for _ in range(self.population_size):
            r = random.random()
            cum = 0
            for i, p in enumerate(probs):
                cum += p
                if r <= cum:
                    selected.append(inds[i])
                    break
        return selected

    def _selection(self, ranked_population):
        if self.selection == 'roulette':
            return self._roulette_selection(ranked_population)
        return self._tournament_selection(ranked_population)

    def _crossover_single(self, p1, p2):
        point = random.randint(1, self.num_nodes - 1) if self.num_nodes > 1 else 1
        child = {}
        for i, node in enumerate(self.nodes):
            child[node] = p1[node] if i < point else p2[node]
        return child

    def _crossover_two_point(self, p1, p2):
        if self.num_nodes < 2:
            return self._crossover_uniform(p1, p2)
        a = random.randint(0, self.num_nodes - 2)
        b = random.randint(a + 1, self.num_nodes - 1)
        child = {}
        for i, node in enumerate(self.nodes):
            if a <= i <= b:
                child[node] = p2[node]
            else:
                child[node] = p1[node]
        return child

    def _crossover_uniform(self, p1, p2):
        child = {}
        for node in self.nodes:
            child[node] = p1[node] if random.random() < 0.5 else p2[node]
        return child

    def _crossover(self, p1, p2):
        if self.crossover == 'single_point':
            return self._crossover_single(p1, p2)
        if self.crossover == 'two_point':
            return self._crossover_two_point(p1, p2)
        return self._crossover_uniform(p1, p2)

    def _mutate_random(self, ind):
        for node in self.nodes:
            if random.random() < self.mutation_rate:
                ind[node] = random.randint(1, self.num_colors)
        return ind

    def _mutate_swap(self, ind):
        for _ in range(int(self.mutation_rate * self.num_nodes) + 1):
            if random.random() < 0.5 and self.num_nodes >= 2:
                a, b = random.sample(self.nodes, 2)
                ind[a], ind[b] = ind[b], ind[a]
        return ind

    def _mutate(self, ind):
        if self.mutation_op == 'swap':
            return self._mutate_swap(ind)
        return self._mutate_random(ind)

    def solve(self):
        self.start_time = time.time()
        self.fitness_history = []
        self.population = [self._create_individual() for _ in range(self.population_size)]

        for gen in range(self.generations):
            ranked = sorted([(ind, self._fitness(ind)) for ind in self.population], key=lambda x: x[1])
            best_fit = ranked[0][1]
            self.fitness_history.append(best_fit)
            if best_fit == 0:
                break

            selected = self._selection(ranked)
            new_pop = [ind for ind, fit in ranked[:2]] if self.elitism else []
            while len(new_pop) < self.population_size:
                p1 = random.choice(selected)
                p2 = random.choice(selected)
                child = self._crossover(p1, p2)
                child = self._mutate(child)
                new_pop.append(child)
            self.population = new_pop

        self.end_time = time.time()
        best_solution = min(self.population, key=lambda ind: self._fitness(ind))
        final_conflicts = self._fitness(best_solution)
        return best_solution, self.get_elapsed_time(), final_conflicts, self.fitness_history

    def get_elapsed_time(self):
        return self.end_time - self.start_time


class GreedyColoringSolver:
    def __init__(self, graph, num_colors):
        self.graph = graph
        self.num_colors = num_colors
        self.colors = {}
        self.start_time = 0
        self.end_time = 0

    def solve(self):
        self.start_time = time.time()
        nodes = sorted(self.graph.nodes(), key=lambda x: self.graph.degree[x], reverse=True)
        for node in nodes:
            used = {self.colors[n] for n in self.graph.neighbors(node) if n in self.colors}
            for c in range(1, self.num_colors + 1):
                if c not in used:
                    self.colors[node] = c
                    break
        self.end_time = time.time()
        conflicts = sum(1 for u, v in self.graph.edges() if self.colors.get(u) == self.colors.get(v))
        return self.colors, self.get_elapsed(), conflicts

    def get_elapsed(self):
        return self.end_time - self.start_time


class MinimaxColoringSolver:
    def __init__(self, graph, num_colors, depth=2):
        self.graph = graph
        self.nodes = list(graph.nodes())
        self.num_colors = num_colors
        self.depth = depth
        self.start = 0
        self.end = 0

    def evaluate(self, coloring):
        conflicts = 0
        for u, v in self.graph.edges():
            if coloring.get(u) == coloring.get(v) and coloring.get(u) is not None:
                conflicts += 1
        return -conflicts

    def get_unassigned_nodes(self, coloring):
        return [n for n in self.nodes if n not in coloring]

    def possible_moves_for_node(self, node):
        return list(range(1, self.num_colors + 1))

    def minimax(self, coloring, depth, alpha, beta, max_player):
        if depth == 0 or len(coloring) == len(self.nodes):
            return self.evaluate(coloring), coloring

        unassigned = self.get_unassigned_nodes(coloring)
        if not unassigned:
            return self.evaluate(coloring), coloring

        node = max(unassigned, key=lambda n: self.graph.degree[n])

        if max_player:
            best_score = -1e9
            best_move = None
            for c in self.possible_moves_for_node(node):
                new_col = coloring.copy()
                new_col[node] = c
                score, _ = self.minimax(new_col, depth - 1, alpha, beta, False)
                if score > best_score:
                    best_score = score
                    best_move = new_col
                alpha = max(alpha, score)
                if beta <= alpha:
                    break
            return best_score, best_move
        else:
            best_score = 1e9
            best_move = None
            for c in self.possible_moves_for_node(node):
                new_col = coloring.copy()
                new_col[node] = c
                score, _ = self.minimax(new_col, depth - 1, alpha, beta, True)
                if score < best_score:
                    best_score = score
                    best_move = new_col
                beta = min(beta, score)
                if beta <= alpha:
                    break
            return best_score, best_move

    def solve(self):
        self.start = time.time()
        init = {}
        score, best = self.minimax(init, self.depth, -1e9, 1e9, True)
        self.end = time.time()
        conflicts = -score
        if best is None:
            best = {}
            nodes = sorted(self.nodes, key=lambda x: self.graph.degree[x], reverse=True)
            for node in nodes:
                if node in best:
                    continue
                used = {best[n] for n in self.graph.neighbors(node) if n in best}
                for c in range(1, self.num_colors + 1):
                    if c not in used:
                        best[node] = c
                        break
        return best, self.end - self.start, conflicts


class GraphVisualizer:
    def __init__(self, tk_frame):
        self.fig, self.ax = plt.subplots(figsize=(5, 4))
        self.canvas = FigureCanvasTkAgg(self.fig, master=tk_frame)
        self.widget = self.canvas.get_tk_widget()
        self.widget.pack(fill='both', expand=True)
        self.graph = None
        self.pos = None

    def draw_graph(self, graph, coloring=None, title=""):
        if coloring is None:
            coloring = {}

        self.graph = graph
        self.ax.clear()

        if self.pos is None or set(self.pos.keys()) != set(self.graph.nodes()):
            try:
                self.pos = nx.spring_layout(self.graph, seed=42)
            except Exception:
                self.pos = nx.spring_layout(self.graph)

        node_list = list(self.graph.nodes())

        palette = {i + 1: mcolors.to_hex(plt.cm.tab20(i % 20)) for i in range(20)}
        colors = []
        for n in node_list:
            col = coloring.get(n, 0)
            colors.append(palette.get(col, '#CCCCCC'))

        nx.draw_networkx(self.graph, ax=self.ax, pos=self.pos, node_color=colors, with_labels=True,
                         font_weight='bold', node_size=700, edge_color='#888888')
        self.ax.set_title(title)
        self.fig.tight_layout()
        try:
            self.canvas.draw_idle()
        except Exception:
            self.canvas.draw()

    def draw_ga_progress(self, fitness_history):
        self.ax.clear()
        if not fitness_history:
            self.ax.text(0.5, 0.5, 'No fitness data', horizontalalignment='center', verticalalignment='center')
        else:
            self.ax.plot(fitness_history, marker='o', markersize=4, linestyle='-')
            self.ax.set_xlabel('Generation')
            self.ax.set_ylabel('Conflicts (lower is better)')
            self.ax.grid(True)
        self.ax.set_title('GA Fitness over Generations')
        self.fig.tight_layout()
        try:
            self.canvas.draw_idle()
        except Exception:
            self.canvas.draw()


class GraphColoringApp:
    def __init__(self, root):
        self.root = root
        self.root.title('Graph Coloring — Multi-GA + Backtracking + Heuristics + Minimax')
        self.root.geometry('1200x800')
        self.graph = nx.Graph()

        main = ttk.Frame(root); main.pack(fill='both', expand=True, padx=8, pady=8)
        left = ttk.Labelframe(main, text='Controls', width=360); left.pack(side='left', fill='y', padx=(0, 8))
        right = ttk.Frame(main); right.pack(side='right', fill='both', expand=True)

        ttk.Label(left, text='Edges (u-v per line) or leave to generate:').pack(pady=(8, 2))
        self.edges_text = tk.Text(left, height=8, width=40)
        self.edges_text.pack(padx=6)
        self.edges_text.insert('1.0', 'WA-NT\nWA-SA\nNT-SA\nNT-Q\nSA-Q\nSA-NSW\nSA-V\nQ-NSW\nV-NSW\nT-V')

        ttk.Button(left, text='Build Graph', command=self.build_graph).pack(fill='x', padx=6, pady=6)

        ttk.Separator(left, orient='horizontal').pack(fill='x', pady=6)

        ttk.Label(left, text='Or generate random graph:').pack(pady=(6, 2))
        gen_frame = ttk.Frame(left); gen_frame.pack(fill='x', padx=6)
        ttk.Label(gen_frame, text='Nodes:').grid(row=0, column=0)
        self.rand_n = tk.IntVar(value=12)
        ttk.Spinbox(gen_frame, from_=4, to=200, textvariable=self.rand_n, width=6).grid(row=0, column=1)
        ttk.Label(gen_frame, text='Prob edge (0-1):').grid(row=1, column=0)
        self.rand_p = tk.DoubleVar(value=0.2)
        ttk.Spinbox(gen_frame, from_=0.01, to=1.0, increment=0.01, textvariable=self.rand_p, width=6).grid(row=1, column=1)
        ttk.Button(left, text='Generate Random Graph', command=self.generate_random_graph).pack(fill='x', padx=6, pady=6)

        ttk.Separator(left, orient='horizontal').pack(fill='x', pady=6)

        ttk.Label(left, text='Choose algorithm:').pack(pady=4)
        self.algo_var = tk.StringVar(value='GA')
        ttk.Radiobutton(left, text='Backtracking', variable=self.algo_var, value='Backtracking').pack(anchor='w', padx=8)
        ttk.Radiobutton(left, text='Genetic Algorithm', variable=self.algo_var, value='GA').pack(anchor='w', padx=8)

        ttk.Label(left, text='m (colors):').pack(pady=4)
        self.m_var = tk.IntVar(value=3)
        ttk.Spinbox(left, from_=2, to=20, textvariable=self.m_var, width=6).pack(padx=6)

        self.ga_frame = ttk.Labelframe(left, text='GA Parameters')
        self.ga_frame.pack(fill='x', padx=6, pady=6)
        ttk.Label(self.ga_frame, text='Population:').pack()
        self.pop_var = tk.IntVar(value=150)
        ttk.Spinbox(self.ga_frame, from_=20, to=1000, textvariable=self.pop_var, width=8).pack()
        ttk.Label(self.ga_frame, text='Mutation rate (0-1):').pack()
        self.mut_var = tk.DoubleVar(value=0.12)
        ttk.Scale(self.ga_frame, from_=0.01, to=1.0, variable=self.mut_var, orient='horizontal').pack(fill='x', padx=6)
        ttk.Label(self.ga_frame, text='Generations:').pack()
        self.gen_var = tk.IntVar(value=300)
        ttk.Spinbox(self.ga_frame, from_=10, to=5000, textvariable=self.gen_var, width=8).pack()

        ttk.Separator(left, orient='horizontal').pack(fill='x', pady=6)
        ttk.Label(left, text='Predefined GA variants (6):').pack()
        self.va_frame = ttk.Frame(left)
        self.va_frame.pack(fill='x', padx=6)

        self.ga_variants = [
            {'name': 'A - Standard', 'selection': 'tournament', 'crossover': 'uniform', 'mutation_op': 'random', 'elitism': True},
            {'name': 'B - Aggressive Mut', 'selection': 'tournament', 'crossover': 'two_point', 'mutation_op': 'random', 'elitism': False},
            {'name': 'C - Roulette+Single', 'selection': 'roulette', 'crossover': 'single_point', 'mutation_op': 'swap', 'elitism': True},
            {'name': 'D - Low-Mut', 'selection': 'tournament', 'crossover': 'uniform', 'mutation_op': 'swap', 'elitism': True},
            {'name': 'E - Roulette-Elite', 'selection': 'roulette', 'crossover': 'uniform', 'mutation_op': 'random', 'elitism': True},
            {'name': 'F - TwoPoint-Swap', 'selection': 'tournament', 'crossover': 'two_point', 'mutation_op': 'swap', 'elitism': False},
        ]

        self.variant_vars = []
        for v in self.ga_variants:
            var = tk.BooleanVar(value=False)
            cb = ttk.Checkbutton(self.va_frame, text=v['name'], variable=var)
            cb.pack(anchor='w')
            self.variant_vars.append(var)

        ttk.Button(left, text='Run Selected Variants', command=self.run_selected_variants).pack(fill='x', padx=6, pady=6)
        ttk.Button(left, text='Run Pairwise Mixes (operators mix)', command=self.run_pairwise_mixes).pack(fill='x', padx=6, pady=2)

        ttk.Separator(left, orient='horizontal').pack(fill='x', pady=6)

        ttk.Label(left, text='Run single algorithms:').pack(pady=(6, 2))
        ttk.Button(left, text='Run Backtracking', command=self.run_backtracking).pack(fill='x', padx=6, pady=4)
        ttk.Button(left, text='Run Greedy Heuristic', command=self.run_greedy).pack(fill='x', padx=6, pady=4)

        mm_frame = ttk.Frame(left); mm_frame.pack(fill='x', padx=6, pady=(2,6))
        ttk.Label(mm_frame, text='Minimax depth:').grid(row=0, column=0, sticky='w')
        self.minimax_depth = tk.IntVar(value=2)
        ttk.Spinbox(mm_frame, from_=1, to=4, textvariable=self.minimax_depth, width=6).grid(row=0, column=1, sticky='w', padx=(6,0))
        ttk.Button(left, text='Run Minimax + AlphaBeta', command=self.run_minimax).pack(fill='x', padx=6, pady=4)

        ttk.Separator(left, orient='horizontal').pack(fill='x', pady=6)
        ttk.Button(left, text='Clear Results', command=self.clear_results).pack(fill='x', padx=6, pady=6)

        plots_pane = ttk.PanedWindow(right, orient='horizontal')
        plots_pane.pack(fill='both', expand=True)
        graph_frame = ttk.Labelframe(plots_pane, text='Graph Visualization')
        plots_pane.add(graph_frame, weight=3)
        self.graph_viz = GraphVisualizer(graph_frame)

        ga_frame = ttk.Labelframe(plots_pane, text='GA Performance (Fitness)')
        plots_pane.add(ga_frame, weight=2)
        self.ga_viz = GraphVisualizer(ga_frame)

        table_frame = ttk.Labelframe(right, text='Results Table', height=220)
        table_frame.pack(side='bottom', fill='x', pady=(6, 0))
        table_frame.pack_propagate(False)

        self.tree = ttk.Treeview(table_frame, columns=('Variant', 'm', 'Time', 'Conflicts', 'Params'), show='headings')
        for col, txt, w in [('Variant', 'Variant', 160), ('m', 'Colors', 60), ('Time', 'Time (s)', 120), ('Conflicts', 'Conflicts', 80), ('Params', 'Params', 350)]:
            self.tree.heading(col, text=txt)
            self.tree.column(col, width=w)
        self.tree.pack(fill='both', expand=True, side='left')
        sb = ttk.Scrollbar(table_frame, orient='vertical', command=self.tree.yview); sb.pack(side='right', fill='y')
        self.tree.configure(yscrollcommand=sb.set)

        self.results = []

        self.build_graph()

    def build_graph(self):
        self.graph.clear()
        s = self.edges_text.get('1.0', tk.END).strip()
        if not s:
            messagebox.showinfo('Info', 'No manual edges provided; use generator.')
            return
        edges = []
        for line in s.splitlines():
            if '-' in line:
                parts = line.strip().split('-')
                if len(parts) >= 2:
                    a = parts[0].strip()
                    b = parts[1].strip()
                    if a and b:
                        edges.append((a, b))
        if not edges:
            messagebox.showwarning('Warning', 'No valid edges parsed.')
            return
        self.graph.add_edges_from(edges)
        self.graph_viz.pos = None
        self.graph_viz.draw_graph(self.graph, title=f'Graph: {self.graph.number_of_nodes()} nodes, {self.graph.number_of_edges()} edges')

    def generate_random_graph(self):
        n = self.rand_n.get(); p = self.rand_p.get()
        self.graph = nx.erdos_renyi_graph(n, p)
        mapping = {i: f'N{i}' for i in range(n)}
        self.graph = nx.relabel_nodes(self.graph, mapping)
        self.graph_viz.pos = None
        self.graph_viz.draw_graph(self.graph, title=f'Random Graph: {n} nodes, p={p}')

    def run_backtracking(self):
        if self.graph.number_of_nodes() == 0:
            messagebox.showwarning('Error', 'Build or generate a graph first.')
            return

        m = self.m_var.get()
        solver = BacktrackingSolver(self.graph, m)

        start = time.time()
        sol, t, conf = solver.solve()
        end = time.time()

        total_time = end - start

        title = f"Backtracking — time={total_time:.5f}s, conflicts={conf}"
        self.graph_viz.draw_graph(self.graph, sol or {}, title=title)

        self._add_result_row("Backtracking", m, total_time, conf, {})

    def run_greedy(self):
        if self.graph.number_of_nodes() == 0:
            messagebox.showwarning('Error', 'Build or generate a graph first.')
            return

        m = self.m_var.get()
        solver = GreedyColoringSolver(self.graph, m)

        start = time.time()
        sol, t, conf = solver.solve()
        end = time.time()

        total_time = end - start

        title = f"Greedy Heuristic — time={total_time:.5f}s, conflicts={conf}"
        self.graph_viz.draw_graph(self.graph, sol or {}, title=title)

        self._add_result_row("Greedy", m, total_time, conf, {})

    def run_minimax(self):
        if self.graph.number_of_nodes() == 0:
            messagebox.showwarning('Error', 'Build or generate a graph first.')
            return

        m = self.m_var.get()
        depth = max(1, self.minimax_depth.get())

        solver = MinimaxColoringSolver(self.graph, m, depth=depth)

        start = time.time()
        sol, t, conf = solver.solve()
        end = time.time()

        total_time = end - start

        title = f"Minimax + AlphaBeta — time={total_time:.5f}s, conflicts={conf}"
        self.graph_viz.draw_graph(self.graph, sol or {}, title=title)

        self._add_result_row("Minimax+AlphaBeta", m, total_time, conf, {"depth": depth})

    def run_selected_variants(self):
        if self.graph.number_of_nodes() == 0:
            messagebox.showwarning('Error', 'Build or generate a graph first.')
            return
        selected = [v for v, flag in zip(self.ga_variants, self.variant_vars) if flag.get()]
        if not selected:
            messagebox.showwarning('Error', 'Choose at least one variant from the 6 variants.')
            return
        m = self.m_var.get()
        for var in selected:
            params = dict(population_size=self.pop_var.get(), mutation_rate=self.mut_var.get(), generations=self.gen_var.get(),
                          selection=var['selection'], crossover=var['crossover'], mutation_op=var['mutation_op'], elitism=var['elitism'])
            solver = GeneticAlgorithmSolver(self.graph, m, **params)
            sol, elapsed, conflicts, hist = solver.solve()
            title = f"{var['name']} (conflicts={conflicts})"
            self.graph_viz.draw_graph(self.graph, sol or {}, title=title)
            self.ga_viz.draw_ga_progress(hist or [])
            self._add_result_row(var['name'], m, elapsed, conflicts, params)

    def run_pairwise_mixes(self):
        if self.graph.number_of_nodes() == 0:
            messagebox.showwarning('Error', 'Build or generate a graph first.')
            return
        chosen = [v for v, flag in zip(self.ga_variants, self.variant_vars) if flag.get()]
        if len(chosen) < 2:
            messagebox.showwarning('Error', 'Select at least two variants to mix their operators.')
            return
        mixes = []
        for a, b in itertools.permutations(chosen, 2):
            mix_name = f"Mix: {a['name']}sel + {b['name']}cross"
            mix_params = {
                'selection': a['selection'],
                'crossover': b['crossover'],
                'mutation_op': random.choice([a['mutation_op'], b['mutation_op']]),
                'elitism': a['elitism'] or b['elitism']
            }
            mixes.append((mix_name, mix_params))
        m = self.m_var.get()
        for name, p in mixes:
            params = dict(population_size=max(60, int(self.pop_var.get() * 0.6)), mutation_rate=self.mut_var.get(),
                          generations=max(60, int(self.gen_var.get() * 0.5)),
                          selection=p['selection'], crossover=p['crossover'], mutation_op=p['mutation_op'], elitism=p['elitism'])
            solver = GeneticAlgorithmSolver(self.graph, m, **params)
            sol, elapsed, conflicts, hist = solver.solve()
            title = f"{name} (conflicts={conflicts})"
            self.graph_viz.draw_graph(self.graph, sol or {}, title=title)
            self.ga_viz.draw_ga_progress(hist or [])
            self._add_result_row(name, m, elapsed, conflicts, params)

    def _add_result_row(self, name, m, elapsed, conflicts, params):
        time_str = f"{elapsed:.4f} s"
        conflicts_str = str(conflicts) if conflicts != -1 else 'Fail'
        param_str = ','.join([f"{k}={v}" for k, v in params.items()]) if params else ''
        self.tree.insert('', 'end', values=(name, m, time_str, conflicts_str, param_str))
        self.results.append({'name': name, 'm': m, 'time': elapsed, 'conflicts': conflicts, 'params': params})
        self.tree.yview_moveto(1.0)

    def clear_results(self):
        for i in self.tree.get_children():
            self.tree.delete(i)
        self.results.clear()


if __name__ == '__main__':
    root = tk.Tk()
    app = GraphColoringApp(root)
    root.mainloop()
