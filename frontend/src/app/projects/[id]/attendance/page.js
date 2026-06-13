'use client';
import { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft, Users, CalendarCheck, X,
  IndianRupee, Banknote, UserCheck, UserX, Search, MoreVertical, CheckCircle2, AlertTriangle, ChevronDown,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import AppShell from '@/components/AppShell';
import api from '@/lib/api';
import { parsePositiveAmount, isValidDateInput } from '@/lib/validation';

export default function ProjectAttendancePage() {
  const params = useParams();
  const id = params?.id;
  const projectIdNum = parseInt(String(id), 10);

  const [project, setProject] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAttendance, setShowAttendance] = useState(null);
  const [attForm, setAttForm] = useState({
    projectId: '', date: new Date().toISOString().split('T')[0],
    status: 'Present', type: 'FullDay', salary: '',
    wantToPay: false, payment: '', paymentNote: '',
    secondSite: false,
    secondProjectId: '',
    wantOvertime: false,
    overtime: '',
  });
  const [saving, setSaving] = useState(false);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [error, setError] = useState('');
  const [bulkError, setBulkError] = useState('');
  const [existingAttendance, setExistingAttendance] = useState(null);
  const [checkingAttendance, setCheckingAttendance] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceDrafts, setAttendanceDrafts] = useState({});
  const [salaryDrafts, setSalaryDrafts] = useState({});
  const [paymentDrafts, setPaymentDrafts] = useState({});
  const [paymentOpen, setPaymentOpen] = useState({});
  const [secondProjectDrafts, setSecondProjectDrafts] = useState({});
  const [overtimeDrafts, setOvertimeDrafts] = useState({});
  const [overtimeOpen, setOvertimeOpen] = useState({});
  // workerId -> attendance record that belongs to a different project on the selected date
  const [crossProjectAttendance, setCrossProjectAttendance] = useState({});
  // Which project we are editing in the modal (null = current project)
  const [attendanceEditProjectId, setAttendanceEditProjectId] = useState(null);
  // Original snapshots (set on every successful data load, used for dirty comparison)
  const [originalAttendanceDrafts, setOriginalAttendanceDrafts] = useState({});
  const [originalSalaryDrafts, setOriginalSalaryDrafts] = useState({});
  const [originalPaymentDrafts, setOriginalPaymentDrafts] = useState({});
  const [originalPaymentOpen, setOriginalPaymentOpen] = useState({});
  const [originalSecondProjectDrafts, setOriginalSecondProjectDrafts] = useState({});
  const [originalOvertimeDrafts, setOriginalOvertimeDrafts] = useState({});
  const [originalOvertimeOpen, setOriginalOvertimeOpen] = useState({});
  // Save-summary confirmation dialog
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  // Success notification (bulk save or modal save)
  const [successMsg, setSuccessMsg] = useState('');
  const successTimeoutRef = useRef(null);
  // Project switcher dropdown
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const projectMenuRef = useRef(null);
  const { t } = useLanguage();
  const router = useRouter();
  const dateStripRef = useRef(null);

  useEffect(() => {
    if (!dateStripRef.current) return;
    const selected = dateStripRef.current.querySelector('[data-selected="true"]');
    if (selected) {
      selected.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [selectedDate]);

  // On mount, immediately jump to today (no animation) so it's always visible
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!dateStripRef.current) return;
      const selected = dateStripRef.current.querySelector('[data-selected="true"]');
      if (selected) {
        selected.scrollIntoView({ behavior: 'instant', block: 'nearest', inline: 'center' });
      }
    }, 80);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close project menu on outside click
  useEffect(() => {
    if (!showProjectMenu) return;
    const handleClick = (e) => {
      if (projectMenuRef.current && !projectMenuRef.current.contains(e.target)) {
        setShowProjectMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, [showProjectMenu]);

  const loadData = () => {
    if (!Number.isFinite(projectIdNum) || projectIdNum < 1) return;
    setLoading(true);
    Promise.all([
      api.get(`/projects/${projectIdNum}`),
      api.get('/workers', { params: { status: 'Active' } }),
      api.get('/projects'),
    ])
      .then(([projRes, wRes, pRes]) => {
        setProject(projRes.data);
        setWorkers(wRes.data);
        setProjects(pRes.data);
      })
      .catch(() => router.replace('/projects'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!Number.isFinite(projectIdNum) || projectIdNum < 1) {
      router.replace('/projects');
      return;
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const recordToDraftType = (record) => {
    if (!record) return 'Absent';
    if (record.type === 'Absent') return 'Absent';
    if (record.type === 'HalfDay') return 'HalfDay';
    if (record.type === 'Other') return 'Other';
    return 'FullDay';
  };

  const loadProjectAttendance = async () => {
    if (!Number.isFinite(projectIdNum) || projectIdNum < 1 || !selectedDate) return;
    setBulkError('');
    try {
      // Fetch current-project records AND all-date records in parallel
      const [res, allRes] = await Promise.all([
        api.get('/attendance', {
          params: { projectId: projectIdNum, startDate: selectedDate, endDate: selectedDate },
        }),
        api.get('/attendance', {
          params: { startDate: selectedDate, endDate: selectedDate },
        }),
      ]);
      const rows = Array.isArray(res.data) ? res.data : [];
      const allRows = Array.isArray(allRes.data) ? allRes.data : [];

      // Workers who have attendance in any project on this date
      const currentProjectWorkerIds = new Set(rows.map((r) => r.workerId));

      // Build cross-project map: workers with attendance in a DIFFERENT project (not in this project's records)
      const crossMap = {};
      allRows.forEach((record) => {
        if (!currentProjectWorkerIds.has(record.workerId)) {
          // Prefer primary split record if multiple records exist for same worker
          if (!crossMap[record.workerId] || !record.primarySplitId) {
            crossMap[record.workerId] = record;
          }
        }
      });
      setCrossProjectAttendance(crossMap);

      setAttendanceRecords(rows);
      const newAttDrafts = rows.reduce((acc, row) => {
        acc[row.workerId] = recordToDraftType(row);
        return acc;
      }, {});
      const newSalDrafts = rows.reduce((acc, row) => {
        acc[row.workerId] = String(row.salary ?? '');
        return acc;
      }, {});
      const newPayDrafts = rows.reduce((acc, row) => {
        const payment =
          row.paymentTotal != null && row.paymentTotal > 0
            ? row.paymentTotal
            : Number(row.payment) || '';
        if (payment) {
          acc[row.workerId] = { amount: String(payment), note: row.paymentNote || '' };
        }
        return acc;
      }, {});
      const newPayOpen = rows.reduce((acc, row) => {
        const hasPayment = (row.paymentTotal || row.payment || 0) > 0;
        if (hasPayment) acc[row.workerId] = true;
        return acc;
      }, {});
      const newSecondDrafts = rows.reduce((acc, row) => {
        if (row.isSplitHalfDay && row.splitPartner?.projectId) {
          acc[row.workerId] = String(row.splitPartner.projectId);
        }
        return acc;
      }, {});
      const newOTDrafts = rows.reduce((acc, row) => {
        if (row.overtime > 0) acc[row.workerId] = String(row.overtime);
        return acc;
      }, {});
      const newOTOpen = rows.reduce((acc, row) => {
        if (row.overtime > 0) acc[row.workerId] = true;
        return acc;
      }, {});

      setAttendanceDrafts(newAttDrafts);
      setSalaryDrafts(newSalDrafts);
      setPaymentDrafts(newPayDrafts);
      setPaymentOpen(newPayOpen);
      setSecondProjectDrafts(newSecondDrafts);
      setOvertimeDrafts(newOTDrafts);
      setOvertimeOpen(newOTOpen);

      // Snapshot the server state for dirty comparison
      setOriginalAttendanceDrafts(newAttDrafts);
      setOriginalSalaryDrafts(newSalDrafts);
      setOriginalPaymentDrafts(newPayDrafts);
      setOriginalPaymentOpen(newPayOpen);
      setOriginalSecondProjectDrafts(newSecondDrafts);
      setOriginalOvertimeDrafts(newOTDrafts);
      setOriginalOvertimeOpen(newOTOpen);
    } catch {
      setAttendanceRecords([]);
      setAttendanceDrafts({});
      setSalaryDrafts({});
      setPaymentDrafts({});
      setPaymentOpen({});
      setSecondProjectDrafts({});
      setOvertimeDrafts({});
      setOvertimeOpen({});
      setCrossProjectAttendance({});
      setOriginalAttendanceDrafts({});
      setOriginalSalaryDrafts({});
      setOriginalPaymentDrafts({});
      setOriginalPaymentOpen({});
      setOriginalSecondProjectDrafts({});
      setOriginalOvertimeDrafts({});
      setOriginalOvertimeOpen({});
    }
  };

  useEffect(() => {
    loadProjectAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectIdNum, selectedDate]);

  const otherProjects = useMemo(
    () => projects.filter((p) => String(p.id) !== String(attForm.projectId)),
    [projects, attForm.projectId]
  );

  const bulkOtherProjects = useMemo(
    () => projects.filter((p) => p.id !== projectIdNum),
    [projects, projectIdNum]
  );

  const filteredWorkers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return workers;
    const qDigits = q.replace(/\D/g, '');
    return workers.filter((w) => {
      const name = (w.name || '').toLowerCase();
      const phone = String(w.phone || '').replace(/\D/g, '');
      const role = (w.role?.name || '').toLowerCase();
      if (name.includes(q) || role.includes(q)) return true;
      if (qDigits.length >= 2 && phone.includes(qDigits)) return true;
      return false;
    });
  }, [workers, search]);

  const openAttendance = (worker) => {
    setShowAttendance(worker);
    setExistingAttendance(null);
    setError('');
    setAttendanceEditProjectId(null);
    setAttForm({
      projectId: String(projectIdNum),
      date: selectedDate,
      status: 'Present',
      type: 'FullDay',
      salary: worker.costPerDay,
      wantToPay: false,
      payment: '',
      paymentNote: '',
      secondSite: false,
      secondProjectId: '',
      wantOvertime: false,
      overtime: '',
    });
  };

  // Opens the modal pre-loaded with the worker's attendance from a different project
  const openCrossProjectAttendance = (worker) => {
    const crossRecord = crossProjectAttendance[worker.id];
    if (!crossRecord) {
      // Fallback: open normal modal if no cross-project record found
      openAttendance(worker);
      return;
    }
    const isAbsent = crossRecord.type === 'Absent';
    const split = crossRecord.isSplitHalfDay && crossRecord.splitPartner;
    const totalSplitSalary = split
      ? crossRecord.salary + crossRecord.splitPartner.salary
      : crossRecord.salary;
    const totalPaid =
      crossRecord.paymentTotal != null && crossRecord.paymentTotal > 0
        ? crossRecord.paymentTotal
        : Number(crossRecord.payment) || 0;
    setShowAttendance(worker);
    setExistingAttendance(null);
    setError('');
    setAttendanceEditProjectId(crossRecord.projectId);
    setAttForm({
      projectId: String(crossRecord.projectId),
      date: selectedDate,
      status: isAbsent ? 'Absent' : 'Present',
      type: isAbsent ? 'FullDay' : (crossRecord.type || 'FullDay'),
      salary: split ? totalSplitSalary : (crossRecord.salary ?? worker.costPerDay),
      wantToPay: totalPaid > 0,
      payment: totalPaid > 0 ? String(totalPaid) : '',
      paymentNote: crossRecord.paymentNote || '',
      secondSite: !!split,
      secondProjectId: split ? String(crossRecord.splitPartner.projectId) : '',
      wantOvertime: (crossRecord.overtime || 0) > 0,
      overtime: (crossRecord.overtime || 0) > 0 ? String(crossRecord.overtime) : '',
    });
  };

  const loadExistingAttendance = async (workerId, date, targetProjectId) => {
    if (!workerId || !date) {
      setExistingAttendance(null);
      return;
    }
    const resolvedProjectId = targetProjectId != null ? targetProjectId : projectIdNum;
    setCheckingAttendance(true);
    try {
      const res = await api.get('/attendance', {
        params: { workerId, startDate: date, endDate: date },
      });
      const rows = Array.isArray(res.data) ? res.data : [];
      const primaryRows = rows.filter(
        (r) => String(r.projectId) === String(resolvedProjectId)
      );
      let record = null;
      if (primaryRows.length === 1) {
        record = primaryRows[0];
      } else if (primaryRows.length >= 2) {
        record =
          primaryRows.find((r) => r.splitSecondaries?.length > 0) ||
          primaryRows.find((r) => !r.primarySplitId) ||
          primaryRows[0];
      }
      setExistingAttendance(record);
      if (record) {
        const isAbsent = record.type === 'Absent';
        const split = record.isSplitHalfDay && record.splitPartner;
        const totalSplitSalary = split ? record.salary + record.splitPartner.salary : record.salary;
        const totalPaid =
          record.paymentTotal != null && record.paymentTotal > 0
            ? record.paymentTotal
            : Number(record.payment) || 0;
        setAttForm((f) => ({
          ...f,
          projectId: String(resolvedProjectId),
          status: isAbsent ? 'Absent' : 'Present',
          type: isAbsent ? f.type : (record.type || 'FullDay'),
          salary: split ? totalSplitSalary : (record.salary ?? f.salary),
          wantToPay: totalPaid > 0,
          payment: totalPaid > 0 ? String(totalPaid) : '',
          paymentNote: record.paymentNote || '',
          secondSite: !!split,
          secondProjectId: split ? String(record.splitPartner.projectId) : '',
          wantOvertime: (record.overtime || 0) > 0,
          overtime: (record.overtime || 0) > 0 ? String(record.overtime) : '',
        }));
      } else {
        setAttForm((f) => ({
          ...f,
          projectId: String(resolvedProjectId),
          secondSite: false,
          secondProjectId: '',
          wantOvertime: false,
          overtime: '',
        }));
      }
    } catch {
      setExistingAttendance(null);
    } finally {
      setCheckingAttendance(false);
    }
  };

  useEffect(() => {
    if (!showAttendance) return;
    loadExistingAttendance(showAttendance.id, attForm.date, attendanceEditProjectId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAttendance?.id, attForm.date, attendanceEditProjectId]);

  const calcSalary = (type, costPerDay, twoSiteHalfDay = false) => {
    if (type === 'FullDay') return costPerDay;
    if (type === 'HalfDay') return twoSiteHalfDay ? costPerDay : costPerDay / 2;
    return 0;
  };

  const handleStatusChange = (status) => {
    if (status === 'Absent') {
      setAttForm((f) => ({
        ...f, status: 'Absent', salary: 0, secondSite: false, secondProjectId: '',
        wantOvertime: false, overtime: '',
      }));
    } else {
      setAttForm((f) => ({
        ...f, status: 'Present',
        salary: String(calcSalary(f.type, showAttendance.costPerDay, f.type === 'HalfDay' && f.secondSite)),
      }));
    }
  };

  const handleTypeChange = (type) => {
    setAttForm((f) => ({
      ...f,
      type,
      salary: String(calcSalary(type, showAttendance.costPerDay, type === 'HalfDay' && f.secondSite)),
      ...(type !== 'HalfDay' ? { secondSite: false, secondProjectId: '' } : {}),
      ...(type !== 'FullDay' ? { wantOvertime: false, overtime: '' } : {}),
    }));
  };

  // Returns null when no attendance has been explicitly set (not-yet-marked state)
  const getDraftType = (workerId) => attendanceDrafts[workerId] ?? null;

  const getExistingRecord = (workerId) =>
    attendanceRecords.find((record) => String(record.workerId) === String(workerId));

  const getSalaryForDraft = (worker, type) => {
    const customSalary = salaryDrafts[worker.id];
    if (customSalary !== undefined && customSalary !== '') {
      const parsed = parsePositiveAmount(customSalary);
      if (parsed !== null) return parsed;
    }
    if (type === 'FullDay') return Number(worker.costPerDay) || 0;
    if (type === 'HalfDay') return (Number(worker.costPerDay) || 0) / 2;
    return 0;
  };

  const defaultSalaryForType = (worker, type) => {
    if (type === 'FullDay') return String(Number(worker.costPerDay) || 0);
    if (type === 'HalfDay') return String((Number(worker.costPerDay) || 0) / 2);
    return '0';
  };

  const setDraftType = (worker, type) => {
    const current = getDraftType(worker.id);
    // Tapping the currently active button deselects it (back to null / unmarked)
    const newType = current === type ? null : type;
    setAttendanceDrafts((drafts) => {
      const updated = { ...drafts };
      if (newType === null) {
        delete updated[worker.id];
      } else {
        updated[worker.id] = newType;
      }
      return updated;
    });
    if (newType !== null) {
      setSalaryDrafts((drafts) => ({ ...drafts, [worker.id]: defaultSalaryForType(worker, newType) }));
    } else {
      setSalaryDrafts((drafts) => { const u = { ...drafts }; delete u[worker.id]; return u; });
      setPaymentOpen((open) => ({ ...open, [worker.id]: false }));
    }
    if (newType !== 'HalfDay') {
      setSecondProjectDrafts((drafts) => ({ ...drafts, [worker.id]: '' }));
    }
    if (newType !== 'FullDay') {
      setOvertimeOpen((open) => ({ ...open, [worker.id]: false }));
      setOvertimeDrafts((drafts) => ({ ...drafts, [worker.id]: '' }));
    }
  };

  const setPaymentAmount = (workerId, amount) => {
    setPaymentDrafts((drafts) => ({
      ...drafts,
      [workerId]: { ...(drafts[workerId] || { note: '' }), amount },
    }));
  };

  const setPaymentNote = (workerId, note) => {
    setPaymentDrafts((drafts) => ({
      ...drafts,
      [workerId]: { ...(drafts[workerId] || { amount: '' }), note },
    }));
  };

  const setOvertimeAmount = (workerId, amount) => {
    setOvertimeDrafts((drafts) => ({ ...drafts, [workerId]: amount }));
  };

  // When second project is set on a half-day, switch salary to full day so the
  // backend can split it 50/50 across both projects. When removed, revert to half.
  const setSecondProjectForWorker = (worker, projectId) => {
    setSecondProjectDrafts((drafts) => ({ ...drafts, [worker.id]: projectId }));
    if (projectId) {
      setSalaryDrafts((drafts) => ({
        ...drafts,
        [worker.id]: String(Number(worker.costPerDay) || 0),
      }));
    } else {
      setSalaryDrafts((drafts) => ({
        ...drafts,
        [worker.id]: String((Number(worker.costPerDay) || 0) / 2),
      }));
    }
  };

  const showSuccess = (msg) => {
    clearTimeout(successTimeoutRef.current);
    setSuccessMsg(msg);
    successTimeoutRef.current = setTimeout(() => setSuccessMsg(''), 4000);
  };

  // True when any worker's current draft differs from the server snapshot
  const isDirty = useMemo(() => {
    for (const worker of workers) {
      if (crossProjectAttendance[worker.id]) continue; // cross-project workers not inline-editable
      const wid = worker.id;
      const origType = originalAttendanceDrafts[wid] ?? null;
      const currType = attendanceDrafts[wid] ?? null;
      if (origType !== currType) return true;
      if (currType === null) continue; // not marked — skip sub-field checks

      // Salary
      const origSal = String(originalSalaryDrafts[wid] ?? '');
      const currSal = String(salaryDrafts[wid] ?? '');
      if (origSal !== currSal) return true;

      // Payment open / amount / note
      const origPayOpen = !!originalPaymentOpen[wid];
      const currPayOpen = !!paymentOpen[wid];
      if (origPayOpen !== currPayOpen) return true;
      if (currPayOpen || origPayOpen) {
        const origPay = originalPaymentDrafts[wid] || {};
        const currPay = paymentDrafts[wid] || {};
        if (String(origPay.amount || '') !== String(currPay.amount || '')) return true;
        if ((origPay.note || '') !== (currPay.note || '')) return true;
      }

      // Second project (HalfDay split)
      const origSecond = String(originalSecondProjectDrafts[wid] ?? '');
      const currSecond = String(secondProjectDrafts[wid] ?? '');
      if (origSecond !== currSecond) return true;

      // Overtime open / amount
      const origOTOpen = !!originalOvertimeOpen[wid];
      const currOTOpen = !!overtimeOpen[wid];
      if (origOTOpen !== currOTOpen) return true;
      if (currOTOpen || origOTOpen) {
        const origOT = String(originalOvertimeDrafts[wid] ?? '');
        const currOT = String(overtimeDrafts[wid] ?? '');
        if (origOT !== currOT) return true;
      }
    }
    return false;
  }, [
    workers, crossProjectAttendance,
    attendanceDrafts, originalAttendanceDrafts,
    salaryDrafts, originalSalaryDrafts,
    paymentOpen, originalPaymentOpen,
    paymentDrafts, originalPaymentDrafts,
    secondProjectDrafts, originalSecondProjectDrafts,
    overtimeOpen, originalOvertimeOpen,
    overtimeDrafts, originalOvertimeDrafts,
  ]);

  // List of worker-level changes to show in the save-summary modal
  const changeSummary = useMemo(() => {
    const typeLabel = { FullDay: 'Present (Full Day)', HalfDay: 'Half Day', Absent: 'Absent' };
    const changes = [];
    for (const worker of workers) {
      if (crossProjectAttendance[worker.id]) continue;
      const wid = worker.id;
      const origType = originalAttendanceDrafts[wid] ?? null;
      const currType = attendanceDrafts[wid] ?? null;
      if (currType === null) continue; // not marked → nothing to save

      const isNew = origType === null;
      const typeChanged = origType !== currType;

      // Salary change (only highlight when type didn't change, otherwise implied)
      let salaryInfo = null;
      if (!isNew && !typeChanged && currType !== 'Absent') {
        const origSal = Number(originalSalaryDrafts[wid] || 0);
        const currSal = Number(salaryDrafts[wid] || 0);
        if (origSal !== currSal) {
          salaryInfo = `Salary ₹${origSal.toLocaleString('en-IN')} → ₹${currSal.toLocaleString('en-IN')}`;
        }
      }

      // Payment
      let paymentInfo = null;
      if (paymentOpen[wid] && paymentDrafts[wid]?.amount) {
        const origAmt = Number(originalPaymentDrafts[wid]?.amount || 0);
        const currAmt = Number(paymentDrafts[wid].amount || 0);
        if (!originalPaymentOpen[wid] || origAmt !== currAmt) {
          paymentInfo = origAmt
            ? `Payment ₹${origAmt.toLocaleString('en-IN')} → ₹${currAmt.toLocaleString('en-IN')}`
            : `+ Payment ₹${currAmt.toLocaleString('en-IN')}`;
        }
      }

      // Overtime
      let overtimeInfo = null;
      if (overtimeOpen[wid] && overtimeDrafts[wid]) {
        const origOT = Number(originalOvertimeDrafts[wid] || 0);
        const currOT = Number(overtimeDrafts[wid] || 0);
        if (!originalOvertimeOpen[wid] || origOT !== currOT) {
          overtimeInfo = origOT
            ? `OT ₹${origOT.toLocaleString('en-IN')} → ₹${currOT.toLocaleString('en-IN')}`
            : `+ OT ₹${currOT.toLocaleString('en-IN')}`;
        }
      }

      if (isNew || typeChanged || salaryInfo || paymentInfo || overtimeInfo) {
        changes.push({ worker, isNew, origType, currType, typeLabel, salaryInfo, paymentInfo, overtimeInfo });
      }
    }
    return changes;
  }, [
    workers, crossProjectAttendance,
    attendanceDrafts, originalAttendanceDrafts,
    salaryDrafts, originalSalaryDrafts,
    paymentOpen, originalPaymentOpen,
    paymentDrafts, originalPaymentDrafts,
    overtimeOpen, originalOvertimeOpen,
    overtimeDrafts, originalOvertimeDrafts,
  ]);

  const saveProjectAttendance = async () => {
    if (bulkSaving) return;
    setBulkError('');
    if (!isValidDateInput(selectedDate)) {
      setBulkError('Please select a valid date');
      return;
    }
    setBulkSaving(true);
    let savedCount = 0;
    let updatedCount = 0;
    try {
      for (const worker of workers) {
        const type = getDraftType(worker.id);
        // Skip workers with no explicit attendance marked (null = untouched)
        if (type === null) continue;
        // Skip workers whose attendance belongs to a different project (edited via modal only)
        if (crossProjectAttendance[worker.id]) continue;
        const existing = getExistingRecord(worker.id);
        const paymentDraft = paymentDrafts[worker.id] || {};
        const paymentAmount =
          paymentOpen[worker.id] && paymentDraft.amount
            ? parsePositiveAmount(paymentDraft.amount)
            : 0;
        if (paymentOpen[worker.id] && paymentDraft.amount && paymentAmount === null) {
          throw new Error(`Please enter a valid payment amount for ${worker.name}`);
        }
        const note = paymentOpen[worker.id] ? (paymentDraft.note || '').trim() : '';
        if (note.length > 500) {
          throw new Error(`Payment note is too long for ${worker.name}`);
        }
        const overtimeAmount =
          overtimeOpen[worker.id] && overtimeDrafts[worker.id]
            ? parsePositiveAmount(overtimeDrafts[worker.id])
            : 0;
        if (overtimeOpen[worker.id] && overtimeDrafts[worker.id] && overtimeAmount === null) {
          throw new Error(`Please enter a valid overtime amount for ${worker.name}`);
        }
        const secondProjectId = secondProjectDrafts[worker.id];
        if (type === 'HalfDay' && secondProjectId && String(secondProjectId) === String(projectIdNum)) {
          throw new Error(`Second project must be different for ${worker.name}`);
        }
        const payload = {
          workerId: worker.id,
          projectId: projectIdNum,
          date: selectedDate,
          type,
          salary: getSalaryForDraft(worker, type),
          payment: paymentAmount || 0,
          overtime: overtimeAmount || 0,
          paymentNote: note,
        };
        if (type === 'HalfDay' && secondProjectId) {
          payload.secondProjectId = parseInt(secondProjectId, 10);
        }
        if (existing?.isSplitHalfDay && type === 'HalfDay' && !secondProjectId) {
          payload.removeSplit = true;
          payload.secondProjectId = null;
        }
        if (existing?.id) {
          const putTargetId =
            existing.isSplitHalfDay && existing.splitPartner
              ? existing.primarySplitId || existing.id
              : existing.id;
          await api.put(`/attendance/${putTargetId}`, payload);
          updatedCount++;
        } else {
          await api.post('/attendance', payload);
          savedCount++;
        }
      }
      await loadProjectAttendance();
      const total = savedCount + updatedCount;
      if (total > 0) {
        const parts = [];
        if (savedCount > 0) parts.push(`${savedCount} new`);
        if (updatedCount > 0) parts.push(`${updatedCount} updated`);
        showSuccess(`Attendance saved — ${parts.join(', ')} (${formattedDate})`);
      } else {
        showSuccess('No changes were saved.');
      }
    } catch (err) {
      setBulkError(err.response?.data?.error || err.message || 'Failed to save attendance');
    } finally {
      setBulkSaving(false);
    }
  };

  // Always show summary before saving so user can review (and get warned on past dates)
  const handleBulkSave = () => {
    setShowSaveConfirm(true);
  };

  const markAttendance = async () => {
    if (saving) return;
    setError('');
    if (!attForm.projectId) return setError(t('attendance_project_required'));
    if (!isValidDateInput(attForm.date)) return setError('Please select a valid date');
    const salaryAmount = attForm.status === 'Absent' ? 0 : parsePositiveAmount(attForm.salary);
    if (attForm.status === 'Present' && salaryAmount === null) {
      return setError('Please enter a valid salary');
    }
    const paymentAmount = attForm.wantToPay && attForm.payment ? parsePositiveAmount(attForm.payment) : 0;
    if (attForm.wantToPay && attForm.payment && paymentAmount === null) {
      return setError('Please enter a valid payment amount');
    }
    if (attForm.paymentNote && attForm.paymentNote.trim().length > 500) {
      return setError('Payment note cannot exceed 500 characters');
    }
    const overtimeAmount = attForm.wantOvertime && attForm.overtime ? parsePositiveAmount(attForm.overtime) : 0;
    if (attForm.wantOvertime && attForm.overtime && overtimeAmount === null) {
      return setError('Please enter a valid overtime amount');
    }
    const finalType = attForm.status === 'Absent' ? 'Absent' : attForm.type;
    if (finalType === 'HalfDay' && attForm.secondSite) {
      if (!attForm.secondProjectId || String(attForm.secondProjectId) === String(attForm.projectId)) {
        return setError(t('second_project_required'));
      }
    }
    setSaving(true);
    try {
      const payload = {
        workerId: showAttendance.id,
        projectId: parseInt(attForm.projectId, 10),
        date: attForm.date,
        type: finalType,
        salary: attForm.status === 'Absent' ? 0 : salaryAmount,
        payment: paymentAmount,
        overtime: overtimeAmount || 0,
        paymentNote: attForm.wantToPay ? attForm.paymentNote.trim() : '',
      };
      const removeSplit =
        !!existingAttendance?.isSplitHalfDay && finalType === 'HalfDay' && !attForm.secondSite;
      if (existingAttendance?.id) {
        if (removeSplit) {
          payload.removeSplit = true;
          payload.secondProjectId = null;
        } else if (finalType === 'HalfDay' && attForm.secondSite && attForm.secondProjectId) {
          payload.secondProjectId = parseInt(attForm.secondProjectId, 10);
        }
        const putTargetId =
          existingAttendance.isSplitHalfDay && existingAttendance.splitPartner
            ? existingAttendance.primarySplitId || existingAttendance.id
            : existingAttendance.id;
        await api.put(`/attendance/${putTargetId}`, payload);
      } else {
        if (finalType === 'HalfDay' && attForm.secondSite && attForm.secondProjectId) {
          payload.secondProjectId = parseInt(attForm.secondProjectId, 10);
        }
        await api.post('/attendance', payload);
      }
      setShowAttendance(null);
      loadData();
      await loadProjectAttendance();
      showSuccess(existingAttendance?.id ? 'Attendance updated successfully' : 'Attendance marked successfully');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to mark attendance');
    } finally { setSaving(false); }
  };

  const API_BASE = process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '')
    : 'http://localhost:5000';
  const presentCount = workers.filter((w) => {
    const t = getDraftType(w.id);
    return t !== null && t !== 'Absent';
  }).length;
  const absentCount = workers.filter((w) => getDraftType(w.id) === 'Absent').length;
  const halfDayCount = workers.filter((w) => getDraftType(w.id) === 'HalfDay').length;
  const totalCost = workers.reduce((sum, w) => {
    const t = getDraftType(w.id);
    if (t === null || t === 'Absent') return sum;
    return sum + getSalaryForDraft(w, t);
  }, 0);
  const formattedDate = new Date(`${selectedDate}T12:00:00`).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];
  // Show last 30 days ending at today — no future dates, oldest first so today is rightmost
  const STRIP_DAYS = 30;
  const dateStrip = Array.from({ length: STRIP_DAYS }, (_, index) => {
    const day = new Date(today);
    day.setDate(today.getDate() - (STRIP_DAYS - 1 - index));
    const value = day.toISOString().split('T')[0];
    return {
      value,
      weekday: day.toLocaleDateString('en-IN', { weekday: 'short' }).toUpperCase(),
      day: String(day.getDate()).padStart(2, '0'),
      isToday: value === todayStr,
    };
  });

  return (
    <AppShell>
      {/* Full-height flex layout: sticky header + scrollable workers + sticky save button */}
      <div className="-mx-4 md:mx-0">

        {/* ── STICKY HEADER (title → search) ── */}
        <div
          className="sticky z-10 bg-gray-50 px-4 md:px-0 pt-1al pb-1 border-b border-gray-100 md:border-0"
          style={{ top: 'calc(var(--safe-top, 0px) + 46px)' }}
        >
          {/* Back button + title + project switcher — single row */}
          <div className="flex items-center gap-2 mb-1">
            <button
              type="button"
              onClick={() => router.push('/projects')}
              className="p-1.5 rounded-xl bg-gray-100 active:bg-gray-200 shrink-0"
              aria-label={t('projects')}
            >
              <ArrowLeft size={18} />
            </button>
            <div className="min-w-0 flex-1 flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-gray-600 shrink-0 leading-none">
                {t('project_attendance_title')}
              </h2>
              <span className="text-gray-300 text-sm leading-none">/</span>
              {/* Project switcher */}
              <div className="relative min-w-0" ref={projectMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowProjectMenu((v) => !v)}
                  className="flex items-center gap-1 text-primary-600 font-bold text-sm hover:text-primary-700 active:opacity-75 transition-opacity"
                  aria-haspopup="listbox"
                  aria-expanded={showProjectMenu}
                >
                  <span className="truncate max-w-[150px]">{project?.name || 'Loading...'}</span>
                  <ChevronDown size={13} className={`shrink-0 transition-transform ${showProjectMenu ? 'rotate-180' : ''}`} />
                </button>
                {showProjectMenu && projects.length > 1 && (
                  <div className="absolute left-0 top-full mt-1 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden min-w-[200px] max-w-[260px]">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 pt-2.5 pb-1">Switch Project</p>
                    {projects
                      .filter((p) => p.id !== projectIdNum)
                      .map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setShowProjectMenu(false);
                            router.push(`/projects/${p.id}/attendance`);
                          }}
                          className="w-full text-left px-3 py-2.5 hover:bg-primary-50 active:bg-primary-100 transition-colors"
                        >
                          <p className="font-semibold text-sm text-gray-800 truncate">{p.name}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            {p.status === 'Running' ? '🟢 Running' : '✅ Completed'}
                          </p>
                        </button>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Summary bar */}
          <div className="rounded-2xl overflow-hidden shadow-md border border-blue-400/20 mb-1 bg-gradient-to-br from-primary-600 to-blue-500 text-white">
            <div className="flex items-center justify-between px-4 py-2.5">
              <div>
                <p className="text-[9px] text-white/60 font-bold uppercase tracking-widest leading-none mb-0.5">Total Cost</p>
                <p className="text-2xl font-black leading-none tracking-tight">₹{totalCost.toLocaleString('en-IN')}</p>
              </div>
              <div className="flex gap-5">
                <div className="text-center">
                  <div className="text-xl font-black text-green-300 leading-none">{presentCount - halfDayCount}</div>
                  <div className="text-[9px] text-white/60 font-semibold mt-0.5">Present</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-black text-yellow-300 leading-none">{halfDayCount}</div>
                  <div className="text-[9px] text-white/60 font-semibold mt-0.5">Half</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-black text-red-300 leading-none">{absentCount}</div>
                  <div className="text-[9px] text-white/60 font-semibold mt-0.5">Absent</div>
                </div>
              </div>
            </div>
          </div>

          {/* Date strip — last 30 days, scrollable, today is rightmost */}
          <div className="rounded-xl bg-white border border-gray-200 shadow-sm mb-1.5 px-2 pt-1.5 pb-1">
            <div className="flex items-center justify-between px-1 mb-1">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Select Date</span>
              <span className="text-[10px] font-semibold text-primary-600">{formattedDate}</span>
            </div>
            <div
              ref={dateStripRef}
              className="flex overflow-x-auto"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {dateStrip.map((item) => {
                const isSelected = item.value === selectedDate;
                const circleBg = item.isToday
                  ? isSelected ? 'bg-amber-500' : 'bg-amber-400'
                  : isSelected ? 'bg-green-600' : 'bg-green-500';
                const labelColor = item.isToday ? 'text-amber-500' : 'text-green-600';
                return (
                  <button
                    key={item.value}
                    data-selected={String(isSelected)}
                    type="button"
                    onClick={() => setSelectedDate(item.value)}
                    style={{ minWidth: 'calc(100% / 7)' }}
                    className={`flex flex-col items-center shrink-0 py-0.5 rounded-xl transition-all active:scale-95 ${
                      isSelected ? 'bg-gray-50' : ''
                    }`}
                  >
                    <span className={`text-[8px] font-bold tracking-wide leading-tight ${labelColor}`}>{item.weekday}</span>
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-black text-white ${circleBg} transition-all ${
                        isSelected ? `shadow-md ring-2 ring-offset-1 ring-offset-white ${item.isToday ? 'ring-amber-400' : 'ring-green-400'}` : ''
                      }`}
                    >
                      {item.day}
                    </span>
                    {item.isToday && <span className="text-[6px] font-bold text-amber-500 leading-none">today</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search + date picker */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" size={16} />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or phone"
                className="w-full bg-white border border-gray-200 rounded-2xl pl-9 pr-3 py-2 text-sm text-gray-700 placeholder-gray-300 focus:border-primary-400 focus:outline-none shadow-sm"
                autoComplete="off"
                aria-label={t('search')}
              />
            </div>
            <input
              type="date"
              className="bg-white border border-gray-200 rounded-2xl px-3 py-2 text-sm text-gray-700 focus:border-primary-400 focus:outline-none shadow-sm shrink-0 w-[9rem]"
              value={selectedDate}
              max={todayStr}
              onChange={(e) => setSelectedDate(e.target.value)}
              aria-label={t('attendance_date')}
            />
          </div>

          {bulkError && (
            <div className="mt-2 bg-red-100 text-red-700 px-3 py-2 rounded-xl text-sm">{bulkError}</div>
          )}
        </div>

        {/* ── WORKER LIST (scrolls normally below sticky header) ── */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-600 border-t-transparent" />
          </div>
        ) : workers.length === 0 ? (
          <div className="mx-4 md:mx-0 mt-4 card text-center py-12">
            <Users size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-400 text-lg">{t('no_data')}</p>
          </div>
        ) : filteredWorkers.length === 0 ? (
          <div className="mx-4 md:mx-0 mt-4 card text-center py-10">
            <Search size={40} className="mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500 font-medium">{t('no_search_matches')}</p>
          </div>
        ) : (
          <div className="px-4 md:px-0 pt-2 space-y-1.5" style={{ paddingBottom: '1rem' }}>
            {filteredWorkers.map((w) => {
              const draftType = getDraftType(w.id);
              const splitProject = secondProjectDrafts[w.id];
              const isCrossProject = !!crossProjectAttendance[w.id];
              const crossRecord = crossProjectAttendance[w.id];
              const options = [
                { key: 'FullDay', label: 'P', active: 'bg-green-500 text-white shadow-sm', idle: 'bg-white text-gray-300 border border-gray-200' },
                { key: 'HalfDay', label: 'HD', active: 'bg-yellow-400 text-gray-800 shadow-sm', idle: 'bg-white text-gray-300 border border-gray-200' },
                { key: 'Absent', label: 'A', active: 'bg-red-500 text-white shadow-sm', idle: 'bg-white text-gray-300 border border-gray-200' },
              ];
              const accentColor = isCrossProject
                ? '#f59e0b'
                : draftType === 'FullDay' ? '#22c55e'
                : draftType === 'HalfDay' ? '#facc15'
                : draftType === 'Absent' ? '#ef4444'
                : '#e5e7eb';
              const avatarCls = isCrossProject
                ? 'bg-amber-100 text-amber-700'
                : draftType === 'FullDay' ? 'bg-green-100 text-green-700'
                : draftType === 'HalfDay' ? 'bg-yellow-100 text-yellow-700'
                : draftType === 'Absent' ? 'bg-red-100 text-red-500'
                : 'bg-gray-100 text-gray-500';
              return (
                <div
                  key={w.id}
                  className={`bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden ${
                    isCrossProject ? 'bg-amber-50/20' : ''
                  }`}
                  style={{ borderLeftWidth: '3px', borderLeftColor: accentColor }}
                >
                  {/* Worker row */}
                  <div className="flex items-center gap-2.5 px-3 py-2">
                    {w.photo ? (
                      <img src={`${API_BASE}${w.photo}`} alt={w.name} className="w-9 h-9 rounded-full object-cover border-2 border-gray-100 shrink-0" />
                    ) : (
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${avatarCls}`}>
                        {w.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-gray-900 truncate">{w.name}</h3>
                      <p className="text-[10px] text-gray-400 truncate">{w.role?.name} · <span className="font-medium text-gray-500">₹{w.costPerDay}</span></p>
                      {/* Cross-project badge */}
                      {isCrossProject && (
                        <div className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-amber-100 border border-amber-300 px-2 py-0.5 max-w-full overflow-hidden">
                          <span className="text-[9px] font-bold text-amber-700 uppercase tracking-wide shrink-0">
                            {crossRecord.type === 'Absent' ? '✗' : '✓'}
                          </span>
                          <span className="text-[9px] font-semibold text-amber-700 truncate">
                            {crossRecord.type === 'Absent' ? 'Absent' : 'Present'} · {crossRecord.project?.name || 'Other project'}
                          </span>
                        </div>
                      )}
                    </div>
                    {/* P / HD / A — disabled when cross-project */}
                    <div className="flex items-center gap-1 shrink-0">
                      {options.map((option) => (
                        <button
                          key={option.key}
                          type="button"
                          onClick={() => !isCrossProject && setDraftType(w, option.key)}
                          disabled={isCrossProject}
                          className={`w-9 h-8 rounded-full text-xs font-black transition-colors ${
                            isCrossProject
                              ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                              : draftType === option.key
                              ? option.active
                              : option.idle
                          }`}
                          aria-label={`${w.name} ${option.label}`}
                          title={isCrossProject ? `Attendance already marked in ${crossRecord?.project?.name || 'another project'}` : undefined}
                        >
                          {option.label}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => isCrossProject ? openCrossProjectAttendance(w) : openAttendance(w)}
                        className={`w-7 h-8 flex items-center justify-center shrink-0 ${
                          isCrossProject
                            ? 'text-amber-400 active:text-amber-600'
                            : 'text-gray-300 active:text-gray-500'
                        }`}
                        aria-label={isCrossProject ? 'Edit cross-project attendance' : 'More attendance options'}
                        title={isCrossProject ? `Edit attendance in ${crossRecord?.project?.name || 'other project'}` : 'More options'}
                      >
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Salary + Pay + OT + Second-project (only when type is set and not cross-project) */}
                  {!isCrossProject && draftType !== null && (
                    <>
                      <div className="mx-3 border-t border-gray-100" />
                      {/* Salary + Pay row */}
                      <div className="px-3 pb-2 pt-1.5 flex gap-2">
                        <div className="flex flex-1 items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1.5">
                          <IndianRupee size={12} className="text-blue-400 shrink-0" />
                          <span className="text-[11px] font-semibold text-blue-500 shrink-0">
                            {draftType === 'HalfDay' && splitProject ? 'Total (÷2)' : 'Day Salary'}
                          </span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={salaryDrafts[w.id] ?? defaultSalaryForType(w, draftType)}
                            disabled={draftType === 'Absent'}
                            onChange={(e) => {
                              setSalaryDrafts((drafts) => ({ ...drafts, [w.id]: e.target.value }));
                            }}
                            className="ml-auto w-20 rounded-lg border-0 bg-white px-2 py-1 text-right text-sm font-bold text-blue-700 outline-none focus:ring-1 focus:ring-blue-300 disabled:bg-transparent disabled:text-gray-300 shadow-sm"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setPaymentOpen((open) => ({ ...open, [w.id]: !open[w.id] }));
                          }}
                          className={`flex shrink-0 items-center justify-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold border ${
                            paymentOpen[w.id]
                              ? 'bg-orange-50 text-orange-600 border-orange-200'
                              : 'bg-white text-gray-400 border-gray-200'
                          }`}
                        >
                          <Banknote size={12} />
                          Pay
                        </button>
                      </div>

                      {/* Second project selector (HalfDay) */}
                      {draftType === 'HalfDay' && bulkOtherProjects.length > 0 && (
                        <div className="px-3 pb-2">
                          <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-2.5 py-2">
                            <label className="mb-1 block text-[10px] font-semibold text-yellow-700 uppercase tracking-wide">
                              2nd site (optional · salary splits 50/50)
                            </label>
                            <select
                              className="w-full rounded-md border border-yellow-300 bg-white px-2 py-1.5 text-sm font-medium text-yellow-900 outline-none focus:border-yellow-400"
                              value={secondProjectDrafts[w.id] || ''}
                              onChange={(e) => setSecondProjectForWorker(w, e.target.value)}
                            >
                              <option value="">Only this project</option>
                              {bulkOtherProjects.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                            </select>
                            {splitProject && (
                              <p className="mt-1 text-[10px] text-yellow-600">
                                ₹{(Number(salaryDrafts[w.id] ?? w.costPerDay) / 2).toLocaleString('en-IN')} per project
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* OT (Over Time) – only when FullDay Present */}
                      {draftType === 'FullDay' && (
                        <div className="px-3 pb-2">
                          <button
                            type="button"
                            onClick={() => {
                              setOvertimeOpen((open) => ({ ...open, [w.id]: !open[w.id] }));
                            }}
                            className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold border ${
                              overtimeOpen[w.id]
                                ? 'bg-violet-50 text-violet-700 border-violet-200'
                                : 'bg-white text-gray-400 border-gray-200'
                            }`}
                          >
                            <span className="flex items-center gap-1">⏱ OT</span>
                            <span className="text-[10px] font-medium">
                              {overtimeOpen[w.id]
                                ? overtimeDrafts[w.id]
                                  ? `₹${Number(overtimeDrafts[w.id]).toLocaleString('en-IN')} · remove`
                                  : 'tap to remove'
                                : '+ Add OT'}
                            </span>
                          </button>
                          {overtimeOpen[w.id] && (
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={overtimeDrafts[w.id] || ''}
                              onChange={(e) => setOvertimeAmount(w.id, e.target.value)}
                              placeholder="Overtime amount (₹)"
                              className="mt-1 w-full rounded-lg border border-violet-200 bg-white px-3 py-1.5 text-sm font-bold text-violet-700 outline-none focus:border-violet-400"
                            />
                          )}
                        </div>
                      )}

                      {/* Payment fields */}
                      {paymentOpen[w.id] && (
                        <div className="px-3 pb-2">
                          <div className="grid grid-cols-[6rem_1fr] gap-1.5 rounded-lg border border-orange-100 bg-orange-50 p-1.5">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={paymentDrafts[w.id]?.amount || ''}
                              onChange={(e) => setPaymentAmount(w.id, e.target.value)}
                              placeholder="₹ Amount"
                              className="rounded-md border border-orange-200 bg-white px-2 py-1.5 text-sm font-bold text-orange-700 outline-none focus:border-orange-400"
                            />
                            <input
                              type="text"
                              maxLength={500}
                              value={paymentDrafts[w.id]?.note || ''}
                              onChange={(e) => setPaymentNote(w.id, e.target.value)}
                              placeholder="Note (optional)"
                              className="min-w-0 rounded-md border border-orange-200 bg-white px-2 py-1.5 text-sm text-orange-600 outline-none focus:border-orange-400"
                            />
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── SAVE BUTTON (fixed above bottom nav on mobile, sticky on desktop) ── */}
        {!loading && workers.length > 0 && (
          <div
            className="sticky att-save-btn-sticky px-4 md:px-0 pt-1.5 pb-2.5 bg-gray-50/95 backdrop-blur-sm border-t border-gray-100 md:border-0"
          >
            {isDirty && selectedDate < todayStr && (
              <p className="text-center text-[10px] text-amber-600 font-medium mb-0.5 flex items-center justify-center gap-1">
                <AlertTriangle size={11} />
                Editing a past date — confirmation required
              </p>
            )}
            {!isDirty && (
              <p className="text-center text-[10px] text-gray-400 mb-0.5">No unsaved changes</p>
            )}
            <button
              type="button"
              onClick={handleBulkSave}
              disabled={bulkSaving || !isDirty}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-white shadow-md transition-all text-sm ${
                bulkSaving
                  ? 'bg-primary-400'
                  : !isDirty
                  ? 'bg-gray-300 shadow-none cursor-not-allowed'
                  : selectedDate < todayStr
                  ? 'bg-amber-500 active:bg-amber-600'
                  : 'bg-primary-600 active:bg-primary-700'
              }`}
            >
              <CalendarCheck size={17} />
              {bulkSaving ? t('loading') : t('save_attendance')}
            </button>
          </div>
        )}
      </div>

      {showAttendance && (
        <div className="modal-overlay z-[70]">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl max-h-[90vh] flex flex-col">
            <div className="overflow-y-auto flex-1 p-3 sm:p-5 space-y-2.5 sm:space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold">
                  {attendanceEditProjectId && attendanceEditProjectId !== projectIdNum
                    ? t('edit_attendance_other_project')
                    : t('mark_attendance')}
                </h3>
                <button
                  onClick={() => { setShowAttendance(null); setAttendanceEditProjectId(null); }}
                  className="p-1"
                >
                  <X size={20} />
                </button>
              </div>
              {checkingAttendance && <div className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg text-xs">{t('checking_attendance')}</div>}
              {existingAttendance && !checkingAttendance && (
                <div className="bg-yellow-50 text-yellow-700 px-3 py-2 rounded-lg text-xs font-medium">
                  {t('attendance_already_marked')}
                </div>
              )}
              {/* Cross-project edit banner */}
              {attendanceEditProjectId && attendanceEditProjectId !== projectIdNum && !checkingAttendance && (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded-lg text-xs font-medium flex items-start gap-2">
                  <span className="text-base leading-none">ℹ️</span>
                  <span>
                    {t('editing_attendance_from')}{' '}
                    <strong>{projects.find((x) => x.id === attendanceEditProjectId)?.name || t('another_project')}</strong>.
                    {' '}{t('changes_will_update_that_project')}
                  </span>
                </div>
              )}
              {error && <div className="bg-red-100 text-red-700 px-3 py-2 rounded-lg text-xs">{error}</div>}

              <div className="bg-primary-50 px-3 py-2 rounded-xl flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-primary-200 flex items-center justify-center text-primary-700 font-bold text-sm">
                  {showAttendance.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{showAttendance.name}</p>
                  <p className="text-[11px] text-gray-500">{showAttendance.role?.name}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[10px] text-gray-400">{t('cost_per_day')}</p>
                  <p className="font-bold text-primary-700 text-base">₹{showAttendance.costPerDay}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-600 font-medium mb-1 text-xs">{t('select_project')}</label>
                  <select
                    className="input-field text-xs !py-2"
                    value={attForm.projectId}
                    onChange={(e) => {
                      const pid = e.target.value;
                      setAttForm((f) => ({
                        ...f,
                        projectId: pid,
                        secondProjectId:
                          f.secondProjectId && String(f.secondProjectId) === String(pid) ? '' : f.secondProjectId,
                      }));
                    }}
                  >
                    <option value="">{t('select_project')}</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-600 font-medium mb-1 text-xs">{t('attendance_date')}</label>
                  <input type="date" className="input-field text-xs !py-2" value={attForm.date} onChange={(e) => setAttForm({ ...attForm, date: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleStatusChange('Present')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${
                    attForm.status === 'Present'
                      ? 'bg-green-500 text-white shadow-md shadow-green-200'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  <UserCheck size={18} />
                  <span className="font-black">P</span>
                  <span className="text-xs font-medium">{t('present')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange('Absent')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${
                    attForm.status === 'Absent'
                      ? 'bg-red-500 text-white shadow-md shadow-red-200'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  <UserX size={18} />
                  <span className="font-black">A</span>
                  <span className="text-xs font-medium">{t('absent')}</span>
                </button>
              </div>

              {attForm.status === 'Present' && (
                <>
                  <div>
                    <label className="block text-gray-600 font-medium mb-1 text-xs">{t('attendance_type')}</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {['FullDay', 'HalfDay', 'Other'].map((type) => (
                        <button
                          key={type} type="button" onClick={() => handleTypeChange(type)}
                          className={`py-2 rounded-xl font-semibold text-xs transition-all ${
                            attForm.type === type
                              ? type === 'FullDay' ? 'bg-green-500 text-white shadow-sm'
                              : type === 'HalfDay' ? 'bg-yellow-500 text-white shadow-sm'
                              : 'bg-gray-600 text-white shadow-sm'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {type === 'FullDay' ? t('full_day') : type === 'HalfDay' ? t('half_day') : t('other')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {attForm.type === 'HalfDay' && attForm.status === 'Present' && otherProjects.length > 0 && (
                    <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50/80 px-3 py-2.5">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={attForm.secondSite}
                          onChange={(e) => {
                            const on = e.target.checked;
                            setAttForm((f) => ({
                              ...f,
                              secondSite: on,
                              secondProjectId:
                                on && !f.secondProjectId && otherProjects[0]
                                  ? String(otherProjects[0].id)
                                  : on
                                    ? f.secondProjectId
                                    : '',
                              salary: String(calcSalary('HalfDay', showAttendance.costPerDay, on)),
                            }));
                          }}
                          className="rounded border-amber-400 text-amber-600 focus:ring-amber-500"
                        />
                        <span className="text-xs font-semibold text-amber-900">{t('add_second_site')}</span>
                      </label>
                      {attForm.secondSite && (
                        <>
                          <div>
                            <label className="block text-[11px] font-medium text-amber-900 mb-1">
                              {t('second_site_project')}
                            </label>
                            <select
                              className="input-field w-full text-sm"
                              value={attForm.secondProjectId}
                              onChange={(e) => setAttForm((f) => ({ ...f, secondProjectId: e.target.value }))}
                            >
                              <option value="">{t('select_project')}</option>
                              {otherProjects.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                            </select>
                          </div>
                          <p className="text-[10px] text-amber-800/90 leading-snug">{t('half_day_split_hint')}</p>
                        </>
                      )}
                    </div>
                  )}

                  <div className="bg-blue-50 rounded-xl px-3 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <IndianRupee size={15} className="text-blue-500" />
                      <span className="font-medium text-xs text-blue-700">{t('day_salary')}</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-24 border-2 border-blue-200 rounded-lg px-2 py-1 text-right text-base font-bold text-blue-700 focus:border-blue-400 focus:outline-none bg-white"
                      value={attForm.salary}
                      onChange={(e) => setAttForm({ ...attForm, salary: e.target.value })}
                    />
                  </div>

                  {/* Overtime — only for FullDay */}
                  {attForm.type === 'FullDay' && (
                    <div className={`rounded-xl border-2 transition-colors ${attForm.wantOvertime ? 'border-purple-300 bg-purple-50' : 'border-gray-200 bg-gray-50'}`}>
                      <button
                        type="button"
                        onClick={() => setAttForm((f) => ({ ...f, wantOvertime: !f.wantOvertime, overtime: f.wantOvertime ? '' : f.overtime }))}
                        className="w-full flex items-center justify-between px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base leading-none">⏱</span>
                          <span className={`font-semibold text-xs ${attForm.wantOvertime ? 'text-purple-700' : 'text-gray-500'}`}>
                            {t('overtime')}
                          </span>
                        </div>
                        <div className={`w-10 h-5 rounded-full transition-colors flex items-center ${attForm.wantOvertime ? 'bg-purple-500 justify-end' : 'bg-gray-300 justify-start'}`}>
                          <div className="w-4 h-4 bg-white rounded-full shadow mx-0.5" />
                        </div>
                      </button>
                      {attForm.wantOvertime && (
                        <div className="px-3 pb-2.5">
                          <label className="block text-purple-600 font-medium mb-0.5 text-xs">{t('overtime_amount')}</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="w-full border-2 border-purple-200 rounded-lg px-3 py-1.5 text-center text-base font-bold text-purple-700 focus:border-purple-400 focus:outline-none bg-white"
                            placeholder="0"
                            value={attForm.overtime}
                            onChange={(e) => setAttForm({ ...attForm, overtime: e.target.value })}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              <div className={`rounded-xl border-2 transition-colors ${attForm.wantToPay ? 'border-orange-300 bg-orange-50' : 'border-gray-200 bg-gray-50'}`}>
                <button
                  type="button"
                  onClick={() => setAttForm((f) => ({ ...f, wantToPay: !f.wantToPay, payment: f.wantToPay ? '' : f.payment, paymentNote: f.wantToPay ? '' : f.paymentNote }))}
                  className="w-full flex items-center justify-between px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <Banknote size={17} className={attForm.wantToPay ? 'text-orange-500' : 'text-gray-400'} />
                    <span className={`font-semibold text-xs ${attForm.wantToPay ? 'text-orange-700' : 'text-gray-500'}`}>
                      {t('pay_now')}
                    </span>
                  </div>
                  <div className={`w-10 h-5 rounded-full transition-colors flex items-center ${attForm.wantToPay ? 'bg-orange-500 justify-end' : 'bg-gray-300 justify-start'}`}>
                    <div className="w-4 h-4 bg-white rounded-full shadow mx-0.5" />
                  </div>
                </button>
                {attForm.wantToPay && (
                  <div className="px-3 pb-2.5 space-y-1.5">
                    <div>
                      <label className="block text-orange-600 font-medium mb-0.5 text-xs">{t('pay_amount')} (₹)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-full border-2 border-orange-200 rounded-lg px-3 py-1.5 text-center text-base font-bold text-orange-700 focus:border-orange-400 focus:outline-none bg-white"
                        placeholder="0"
                        value={attForm.payment}
                        onChange={(e) => setAttForm({ ...attForm, payment: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-orange-600 font-medium mb-0.5 text-xs">{t('payment_note')}</label>
                      <input
                        type="text"
                        maxLength={500}
                        className="w-full border-2 border-orange-200 rounded-lg px-3 py-1.5 text-xs text-orange-700 focus:border-orange-400 focus:outline-none bg-white"
                        placeholder={t('payment_note_placeholder')}
                        value={attForm.paymentNote}
                        onChange={(e) => setAttForm({ ...attForm, paymentNote: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-shrink-0 px-3 pt-2 sm:px-5 border-t border-gray-100 bg-white rounded-b-3xl sm:rounded-b-2xl pb-[calc(1rem+72px+env(safe-area-inset-bottom,0px))] sm:pb-4">
              <button
                onClick={markAttendance}
                disabled={saving}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-white text-sm transition-all ${
                  attForm.status === 'Present'
                    ? 'bg-green-500 active:bg-green-600'
                    : 'bg-red-500 active:bg-red-600'
                } ${saving ? 'opacity-60' : ''}`}
              >
                <CalendarCheck size={18} />
                {saving ? t('loading') : existingAttendance ? t('update_attendance') : t('save_attendance')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SAVE SUMMARY CONFIRMATION MODAL ── */}
      {showSaveConfirm && (
        <div className="modal-overlay z-[80]">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl mx-4 flex flex-col max-h-[80vh]">
            {/* Header */}
            <div className="px-5 pt-5 pb-3 flex items-start gap-3 border-b border-gray-100 shrink-0">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${selectedDate < todayStr ? 'bg-amber-100' : 'bg-blue-100'}`}>
                <CalendarCheck size={20} className={selectedDate < todayStr ? 'text-amber-600' : 'text-primary-600'} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-800 text-base">Save Attendance?</h3>
                <p className="text-xs text-gray-500 mt-0.5">{formattedDate}</p>
                {selectedDate < todayStr && (
                  <p className="text-xs text-amber-600 font-medium mt-1 flex items-center gap-1">
                    <AlertTriangle size={11} className="shrink-0" />
                    Past date — saved records will be permanently updated
                  </p>
                )}
              </div>
              <button type="button" onClick={() => setShowSaveConfirm(false)} className="p-1 text-gray-400 active:text-gray-600 shrink-0">
                <X size={18} />
              </button>
            </div>

            {/* Change list */}
            <div className="overflow-y-auto flex-1 px-4 py-3 space-y-2">
              {changeSummary.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No changes to save.</p>
              ) : (
                <>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
                    {changeSummary.length} worker{changeSummary.length !== 1 ? 's' : ''} will be updated
                  </p>
                  {changeSummary.map(({ worker, isNew, origType, currType, typeLabel, salaryInfo, paymentInfo, overtimeInfo }) => {
                    const typeColor = {
                      FullDay: 'bg-green-100 text-green-700',
                      HalfDay: 'bg-yellow-100 text-yellow-700',
                      Absent: 'bg-red-100 text-red-600',
                    };
                    return (
                      <div key={worker.id} className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs shrink-0">
                            {worker.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-800 truncate">{worker.name}</p>
                            <p className="text-[10px] text-gray-400">{worker.role?.name}</p>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeColor[currType] || 'bg-gray-100 text-gray-500'}`}>
                            {typeLabel[currType] || currType}
                          </span>
                        </div>
                        {/* Change details */}
                        <div className="pl-9 space-y-0.5">
                          {isNew ? (
                            <p className="text-[11px] text-green-600 font-medium">New attendance</p>
                          ) : origType !== currType ? (
                            <p className="text-[11px] text-blue-600 font-medium">
                              {typeLabel[origType] || origType || '—'} → {typeLabel[currType] || currType}
                            </p>
                          ) : null}
                          {salaryInfo && <p className="text-[11px] text-gray-500">{salaryInfo}</p>}
                          {paymentInfo && <p className="text-[11px] text-orange-600 font-medium">{paymentInfo}</p>}
                          {overtimeInfo && <p className="text-[11px] text-purple-600 font-medium">{overtimeInfo}</p>}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 px-4 pt-3 border-t border-gray-100 shrink-0" style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))' }}>
              <button
                type="button"
                onClick={() => setShowSaveConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 active:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={changeSummary.length === 0}
                onClick={() => {
                  setShowSaveConfirm(false);
                  saveProjectAttendance();
                }}
                className={`flex-1 py-2.5 rounded-xl text-white text-sm font-bold transition-all ${
                  changeSummary.length === 0
                    ? 'bg-gray-300 cursor-not-allowed'
                    : selectedDate < todayStr
                    ? 'bg-amber-500 active:bg-amber-600'
                    : 'bg-primary-600 active:bg-primary-700'
                }`}
              >
                {selectedDate < todayStr ? 'Yes, Update' : 'Save Attendance'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SUCCESS TOAST ── */}
      {successMsg && (
        <div className="fixed bottom-[calc(80px+env(safe-area-inset-bottom,0px))] left-0 right-0 z-[90] flex justify-center px-4 pointer-events-none">
          <div className="bg-gray-900 text-white rounded-2xl px-4 py-3 flex items-center gap-2.5 shadow-xl max-w-sm w-full pointer-events-auto animate-fade-in-up">
            <CheckCircle2 size={20} className="text-green-400 shrink-0" />
            <p className="text-sm font-medium leading-snug">{successMsg}</p>
            <button
              type="button"
              onClick={() => { clearTimeout(successTimeoutRef.current); setSuccessMsg(''); }}
              className="ml-auto text-gray-400 active:text-white shrink-0"
              aria-label="Dismiss"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
