import type { Console } from "@/model/Console";

export class RecentConsolesHandler {
    readonly RECENT_KEY = 'vgch_recent_consoles';

    loadRecentConsoles(allConsoles: Console[]) {
        const raw = localStorage.getItem(this.RECENT_KEY);
        let result: Console[] = [];

        if (!raw) {
            return result;
        }
        try {
            const arr = JSON.parse(raw);
            if (Array.isArray(arr)) {
                result = arr
                    .map((id: string) => allConsoles.find((c) => c.identifier === id))
                    .filter(Boolean) as Console[];
            }
        } catch {}

        return result;
    }

    saveRecentConsoles(recentConsoles: Console[]) {
        localStorage.setItem(this.RECENT_KEY,
            JSON.stringify(recentConsoles.map((c) => c.identifier)));
}
}
