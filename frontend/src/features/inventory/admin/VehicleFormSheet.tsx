import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Alert } from '../../../components/ui/Alert';
import { Button } from '../../../components/ui/Button';
import { SelectField } from '../../../components/ui/SelectField';
import { Sheet } from '../../../components/ui/Sheet';
import { TextField } from '../../../components/ui/TextField';
import { ApiError } from '../../../lib/api';
import { type VehicleInput, vehiclesApi } from '../../../lib/api/endpoints';
import { CATEGORIES, type Category, type Vehicle } from '../../../lib/api/types';
import { categoryLabel } from '../../../lib/format';
import { VehicleMedia } from '../VehicleMedia';
import { vehicleKeys } from '../useVehicles';
import { replaceCachedVehicle } from '../vehicleCache';
import {
  CREATE_FIELDS,
  EMPTY_VEHICLE_FORM,
  type VehicleFormField,
  type VehicleFormValues,
  createVehicleFormSchema,
  editVehicleFormSchema,
  toFormValues,
  toVehicleInput,
} from './vehicleForm';

const CATEGORY_OPTIONS = [
  { value: '', label: 'Choose…' },
  ...CATEGORIES.map((category) => ({ value: category, label: categoryLabel(category) })),
];

/** `vehicle` null = add a new vehicle; a vehicle = edit its details (US-A2, US-A3). */
export function VehicleFormSheet({
  open,
  vehicle,
  onClose,
}: {
  open: boolean;
  vehicle: Vehicle | null;
  onClose: () => void;
}) {
  const [dirty, setDirty] = useState(false);
  const [confirmingDiscard, setConfirmingDiscard] = useState(false);

  const close = () => {
    setDirty(false);
    setConfirmingDiscard(false);
    onClose();
  };
  // Unsaved edits are never lost silently (HIG Sheets): Cancel, Escape and the backdrop ask first.
  const requestClose = () => (dirty ? setConfirmingDiscard(true) : close());

  return (
    <>
      <Sheet open={open} onClose={requestClose} title={vehicle ? 'Edit Vehicle' : 'Add Vehicle'}>
        {open && <VehicleForm vehicle={vehicle} onDone={close} onDirtyChange={setDirty} />}
      </Sheet>
      <Sheet
        open={confirmingDiscard}
        onClose={() => setConfirmingDiscard(false)}
        variant="alert"
        title="Discard changes?"
        description="Your edits will be lost."
      >
        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          <Button
            variant="quiet"
            fullWidth
            data-autofocus
            onClick={() => setConfirmingDiscard(false)}
          >
            Keep Editing
          </Button>
          <Button variant="destructive" fullWidth onClick={close}>
            Discard
          </Button>
        </div>
      </Sheet>
    </>
  );
}

function VehicleForm({
  vehicle,
  onDone,
  onDirtyChange,
}: {
  vehicle: Vehicle | null;
  onDone: () => void;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const isEdit = vehicle !== null;
  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isDirty, dirtyFields, isSubmitting },
  } = useForm<VehicleFormValues>({
    resolver: zodResolver(isEdit ? editVehicleFormSchema : createVehicleFormSchema),
    mode: 'onTouched',
    defaultValues: vehicle ? toFormValues(vehicle) : EMPTY_VEHICLE_FORM,
  });

  useEffect(() => onDirtyChange(isDirty), [isDirty, onDirtyChange]);

  const save = useMutation({
    mutationFn: (values: VehicleFormValues) => {
      if (!vehicle) {
        return vehiclesApi.create(toVehicleInput(values, CREATE_FIELDS) as VehicleInput);
      }
      // Only the fields the admin actually changed are sent.
      const changed = (Object.keys(dirtyFields) as VehicleFormField[]).filter(
        (field) => field !== 'quantity',
      );
      return vehiclesApi.update(vehicle.id, toVehicleInput(values, changed));
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const saved = await save.mutateAsync(values);
      if (isEdit) {
        replaceCachedVehicle(queryClient, saved);
        toast.success(`Saved ${saved.make} ${saved.model}`);
      } else {
        void queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
        toast.success(`Added ${saved.make} ${saved.model}`);
      }
      onDone();
    } catch (error) {
      if (!(error instanceof ApiError)) {
        setError('root', { message: 'Something went wrong. Please try again.' });
        return;
      }
      const fieldErrors = (error.details ?? []).filter(
        (detail) => detail.field in EMPTY_VEHICLE_FORM,
      );
      if (fieldErrors.length === 0) {
        setError('root', { message: error.message });
        return;
      }
      fieldErrors.forEach(({ field, message }) => setError(field as VehicleFormField, { message }));
    }
  });

  // Live preview of the card image: the photo if the URL loads, otherwise the category art.
  const [imageUrl, category, make, model, color, year] = watch([
    'imageUrl',
    'category',
    'make',
    'model',
    'color',
    'year',
  ]);
  const previewCategory = (CATEGORIES as readonly string[]).includes(category)
    ? (category as Category)
    : 'SEDAN';

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4 pb-2">
      {errors.root?.message && <Alert>{errors.root.message}</Alert>}
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Make"
          maxLength={50}
          autoComplete="off"
          error={errors.make?.message}
          {...register('make')}
        />
        <TextField
          label="Model"
          maxLength={50}
          autoComplete="off"
          error={errors.model?.message}
          {...register('model')}
        />
        <SelectField
          label="Category"
          options={CATEGORY_OPTIONS}
          error={errors.category?.message}
          {...register('category')}
        />
        <TextField
          label="Year"
          inputMode="numeric"
          maxLength={4}
          error={errors.year?.message}
          {...register('year')}
        />
        <TextField
          label="Colour"
          maxLength={50}
          autoComplete="off"
          error={errors.color?.message}
          {...register('color')}
        />
        <TextField
          label="Price"
          inputMode="decimal"
          leading="₹"
          error={errors.price?.message}
          {...register('price')}
        />
        {isEdit ? (
          <div className="flex flex-col justify-end sm:col-span-2">
            <p className="rounded-md bg-plate px-3 py-2.5 text-body text-ink-2">
              Stock: {vehicle.quantity} · use Restock to change
            </p>
          </div>
        ) : (
          <TextField
            label="Initial stock"
            inputMode="numeric"
            hint="Units available to sell now"
            error={errors.quantity?.message}
            {...register('quantity')}
          />
        )}
        <TextField
          label="Image URL (optional)"
          type="url"
          inputMode="url"
          placeholder="https://"
          className={isEdit ? 'sm:col-span-2' : undefined}
          error={errors.imageUrl?.message}
          {...register('imageUrl')}
        />
      </div>
      <div className="flex items-center gap-3 rounded-md bg-plate p-2">
        <VehicleMedia
          key={imageUrl}
          compact
          vehicle={{
            id: 'preview',
            make,
            model,
            color,
            year: Number(year) || 0,
            category: previewCategory,
            imageUrl: imageUrl.trim() || null,
            price: 0,
            quantity: 0,
            createdAt: '',
            updatedAt: '',
          }}
          className="aspect-[16/10] w-28 shrink-0 rounded-[8px]"
        />
        <p className="text-micro text-ink-2">
          Card image preview. Without a photo, the category illustration is shown.
        </p>
      </div>
      <Button
        type="submit"
        size="lg"
        fullWidth
        disabled={isEdit && !isDirty}
        loading={isSubmitting}
        loadingText="Saving…"
      >
        Save
      </Button>
    </form>
  );
}
