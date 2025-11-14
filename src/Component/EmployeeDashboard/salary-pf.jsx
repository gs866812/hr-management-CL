import { KeyRound, Lock, Unlock } from "lucide-react";

export default function SalaryPF() {
    return (
        <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Salary & PF</h3>
                <div className="flex items-center gap-2">
                    {!salaryUnlocked ? (
                        <button
                            onClick={openUnlockModal}
                            className="btn btn-sm bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1"
                        >
                            <Unlock size={16} /> Unlock
                        </button>
                    ) : (
                        <button
                            onClick={lockSalary}
                            className="btn btn-sm bg-gray-200 text-gray-700 flex items-center gap-1"
                        >
                            <Lock size={16} /> Lock
                        </button>
                    )}
                    <button
                        onClick={openChangePinModal}
                        className="btn btn-sm bg-yellow-500 hover:bg-yellow-600 text-white flex items-center gap-1"
                    >
                        <KeyRound size={16} />
                        PIN
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Salary – masked until unlocked */}
                <div className="bg-gray-50 p-3 rounded-lg border">
                    <div className="text-xs text-gray-500">Monthly Salary</div>
                    <div
                        className={`font-semibold ${
                            salaryUnlocked ? 'text-green-600' : 'text-gray-700'
                        }`}
                    >
                        {salaryUnlocked ? monthlySalary : maskedSalary}
                    </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border">
                    <div className="text-xs text-gray-500">PF Status</div>
                    <div className="font-semibold">
                        {salaryAndPF?.pfStatus || 'inactive'}
                    </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border">
                    <div className="text-xs text-gray-500">Monthly PF (5%)</div>
                    <div className="font-semibold text-blue-600">
                        {monthlyPF}
                    </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border">
                    <div className="text-xs text-gray-500">
                        Total PF Balance
                    </div>
                    <div className="font-semibold text-blue-600">
                        {pfBalance}
                    </div>
                </div>
            </div>

            <div className="mt-3 p-3 bg-blue-50 text-sm rounded-lg border border-blue-100 flex items-start">
                <Info size={16} className="text-blue-600 mr-2 mt-0.5" />
                <div>
                    Your salary is hidden by default on this device. Click{' '}
                    <b>Unlock Salary</b> and enter your PIN to view it. It will
                    re-lock when you close this tab.
                </div>
            </div>
        </div>
    );
}
