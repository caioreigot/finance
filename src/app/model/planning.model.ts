export interface PlanningRowData {
  id: string;
  isChecked: boolean;
  label: string;
  price: number;
}

export interface PlanningFormInputs {
  label: string | null;
  price: number | null;
}