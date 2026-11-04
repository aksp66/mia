import 'fake-indexeddb/auto';
import '../src/i18n';
import { beforeEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import Journal from '../src/features/journal/Journal';
import Calendar from '../src/features/calendrier/Calendar';
import { ToastProvider } from '../src/ui/components';
import { db } from '../src/data/db';
import { addDays, today } from '../src/domain/calendarDate';
import { fmtLong } from '../src/app/hooks';

const D = today();
const Y = addDays(D, -1);

function Probe() {
  const l = useLocation();
  return <p data-testid="loc">{l.pathname + l.search}</p>;
}

function renderJournal(url: string) {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <ToastProvider>
        <Routes>
          <Route
            path="/journal/:date"
            element={
              <>
                <Probe />
                <Journal />
              </>
            }
          />
        </Routes>
      </ToastProvider>
    </MemoryRouter>,
  );
}

const periodToggle = () => screen.getByRole('checkbox', { name: 'Début des règles' }) as HTMLInputElement;
const dayButton = (d: string) => screen.getByRole('button', { name: fmtLong(d as never) });

beforeEach(async () => {
  cleanup();
  await db.dayLogs.clear();
  await db.periods.clear();
});

describe('Journal : mode et changement de jour', () => {
  it('le début des règles est désactivé par défaut et en mode symptômes, activé en mode règles', async () => {
    renderJournal(`/journal/${D}`);
    await screen.findByRole('heading', { level: 1 });
    expect(periodToggle().checked).toBe(false);
    cleanup();
    renderJournal(`/journal/${D}?mode=symptoms`);
    await screen.findByRole('heading', { level: 1 });
    expect(periodToggle().checked).toBe(false);
    cleanup();
    renderJournal(`/journal/${D}?mode=period`);
    await screen.findByRole('heading', { level: 1 });
    expect(periodToggle().checked).toBe(true);
  });

  it('choisir un autre jour conserve le mode symptômes et ne crée aucune règle', async () => {
    const user = userEvent.setup();
    renderJournal(`/journal/${D}?mode=symptoms`);
    await screen.findByRole('heading', { level: 1 });
    await user.click(dayButton(Y));
    await waitFor(() => expect(screen.getByTestId('loc').textContent).toBe(`/journal/${Y}?mode=symptoms`));
    await screen.findByRole('heading', { level: 1, name: new RegExp(fmtLong(Y)) });
    expect(periodToggle().checked).toBe(false);
    await user.click(screen.getByRole('button', { name: /Crampes/ }));
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }));
    await waitFor(async () => expect((await db.dayLogs.get(Y))?.symptoms).toEqual(['cramps']));
    expect(await db.periods.count()).toBe(0);
  });

  it('prévient avant de quitter un jour modifié : rester, abandonner', async () => {
    const user = userEvent.setup();
    renderJournal(`/journal/${D}?mode=symptoms`);
    await screen.findByRole('heading', { level: 1 });
    await user.click(screen.getByRole('button', { name: /Crampes/ }));
    await user.click(dayButton(Y));
    expect(await screen.findByText(/modifications non enregistrées/)).toBeTruthy();
    expect(screen.getByTestId('loc').textContent).toBe(`/journal/${D}?mode=symptoms`);
    await user.click(screen.getByRole('button', { name: 'Rester sur ce jour' }));
    expect(screen.queryByText(/modifications non enregistrées/)).toBeNull();
    await user.click(dayButton(Y));
    await user.click(await screen.findByRole('button', { name: 'Abandonner les modifications' }));
    await waitFor(() => expect(screen.getByTestId('loc').textContent).toBe(`/journal/${Y}?mode=symptoms`));
    expect(await db.dayLogs.get(D)).toBeUndefined();
  });

  it('« Enregistrer et changer de jour » enregistre puis change de jour', async () => {
    const user = userEvent.setup();
    renderJournal(`/journal/${D}?mode=symptoms`);
    await screen.findByRole('heading', { level: 1 });
    await user.click(screen.getByRole('button', { name: /Fatigue/ }));
    await user.click(dayButton(Y));
    await user.click(await screen.findByRole('button', { name: 'Enregistrer et changer de jour' }));
    await waitFor(() => expect(screen.getByTestId('loc').textContent).toBe(`/journal/${Y}?mode=symptoms`));
    expect((await db.dayLogs.get(D))?.symptoms).toEqual(['fatigue']);
    expect(await db.periods.count()).toBe(0);
  });

  it('sans modification, le changement de jour est immédiat', async () => {
    const user = userEvent.setup();
    renderJournal(`/journal/${D}?mode=symptoms`);
    await screen.findByRole('heading', { level: 1 });
    await user.click(dayButton(Y));
    await waitFor(() => expect(screen.getByTestId('loc').textContent).toBe(`/journal/${Y}?mode=symptoms`));
    expect(screen.queryByText(/modifications non enregistrées/)).toBeNull();
  });
});

describe('Calendrier à défilement continu', () => {
  it('affiche plusieurs mois et permet d\'en ajouter', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <MemoryRouter>
        <ToastProvider>
          <Calendar />
        </ToastProvider>
      </MemoryRouter>,
    );
    await screen.findByRole('button', { name: 'Afficher les mois précédents' });
    const count = () => container.querySelectorAll('section.cal-card').length;
    expect(count()).toBe(6 + 12 + 1);
    await user.click(screen.getByRole('button', { name: 'Afficher les mois précédents' }));
    expect(count()).toBe(6 + 12 + 1 + 6);
    await user.click(screen.getByRole('button', { name: 'Afficher les mois suivants' }));
    expect(count()).toBe(6 + 12 + 1 + 12);
  });
});
