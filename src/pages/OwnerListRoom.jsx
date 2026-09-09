import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Check, ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";
import { useOwnerRooms } from "@/hooks/useRooms";
import { api, getErrorMessage } from "@/lib/api";
import PublicListRoom from "./ListRoom";

const roomTypes = [
  "Single Room",
  "Double Room",
  "Flat",
  "Apartment",
  "Hostel Room",
  "House",
];

const furnishedOptions = [
  "Furnished",
  "Semi-Furnished",
  "Unfurnished",
];

const tenantOptions = [
  "Student",
  "Family",
  "Working Professional",
  "Anyone",
];

const facilityOptions = [
  "Attached Bathroom",
  "Shared Bathroom",
  "Kitchen",
  "Drinking Water",
  "Electricity",
  "Wi-Fi",
  "Bike Parking",
  "Car Parking",
  "Balcony",
  "CCTV",
  "Solar Water",
  "Furnished",
  "Pet Friendly",
  "24-Hour Water",
];

const blank = {
  title: "",
  roomType: "Single Room",
  numberOfRooms: "1",
  monthlyRent: "",
  securityDeposit: "0",
  province: "Koshi Province",
  district: "",
  municipality: "",
  ward: "",
  area: "",
  street: "",
  fullAddress: "",
  nearestLandmark: "",
  landmarkDistance: "",
  floor: "",
  furnishedStatus: "Unfurnished",
  preferredTenant: "Anyone",
  availableFrom: "",
  preferredContact: "Phone",
  showPhone: true,
  charges: {
    electricity: "Separate",
    water: "Included",
    internet: "Separate",
  },
  facilities: [],
};

const ListRoom = () => {
  const { owner, loading: authLoading } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const editId = params.get("edit");

  const { data: ownerRooms = [] } = useOwnerRooms(Boolean(owner));

  const [form, setForm] = useState(blank);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const editingRoom = useMemo(
    () => ownerRooms.find((r) => (r.id || r._id) === editId),
    [ownerRooms, editId],
  );

  useEffect(() => {
    if (!editingRoom) return;

    setForm({
      ...blank,
      ...editingRoom,
      monthlyRent: String(editingRoom.monthlyRent ?? ""),
      securityDeposit: String(editingRoom.securityDeposit ?? 0),
      numberOfRooms: String(editingRoom.numberOfRooms ?? 1),
      availableFrom: editingRoom.availableFrom
        ? String(editingRoom.availableFrom).slice(0, 10)
        : "",
      charges: {
        ...blank.charges,
        ...editingRoom.charges,
      },
      facilities: editingRoom.facilities || [],
      showPhone: editingRoom.contact?.showPhone !== false,
      preferredContact:
        editingRoom.contact?.preferredContact || "Phone",
    });

    setExistingImages(editingRoom.images || []);
    setFiles([]);
    setPreviews([]);
  }, [editingRoom]);

  const totalImages = existingImages.length + files.length;

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files || []);

    if (totalImages + selected.length > 10) {
      e.target.value = "";
      return toast.error(
        t("A listing can contain a maximum of 10 photos."),
      );
    }

    setFiles((current) => [...current, ...selected]);

    selected.forEach((file) => {
      const reader = new FileReader();

      reader.onloadend = () =>
        setPreviews((current) => [...current, reader.result]);

      reader.readAsDataURL(file);
    });

    e.target.value = "";
  };

  const removeExisting = (index) => {
    setExistingImages((current) =>
      current.filter((_, i) => i !== index),
    );
  };

  const removeNew = (index) => {
    setFiles((current) =>
      current.filter((_, i) => i !== index),
    );

    setPreviews((current) =>
      current.filter((_, i) => i !== index),
    );
  };

  const toggleFacility = (name) => {
    setForm((current) => ({
      ...current,
      facilities: current.facilities.includes(name)
        ? current.facilities.filter((item) => item !== name)
        : [...current.facilities, name],
    }));
  };

  const submit = async (e, saveAsDraft = false) => {
    e.preventDefault();

    if (!owner) return navigate("/auth");

    const required = [
      "title",
      "roomType",
      "monthlyRent",
      "province",
      "district",
      "municipality",
      "area",
      "nearestLandmark",
      "landmarkDistance",
    ];

    if (
      required.some(
        (key) => !String(form[key] || "").trim(),
      )
    ) {
      return toast.error(
        t("Please complete all required room details."),
      );
    }

    if (totalImages < 5) {
      return toast.error(
        t("Please upload at least 5 room photos."),
      );
    }

    setLoading(true);

    try {
      const fd = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (key === "facilities" || key === "charges") {
          fd.append(key, JSON.stringify(value));
        } else {
          fd.append(key, String(value));
        }
      });

      if (editId) {
        fd.append(
          "existingImages",
          JSON.stringify(existingImages),
        );
      }

      files.forEach((file) => fd.append("images", file));

      fd.append("saveAsDraft", String(saveAsDraft));

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };

      const response = editId
        ? await api.patch(`/rooms/${editId}`, fd, config)
        : await api.post("/rooms", fd, config);

      toast.success(t(response.data.message));
      navigate("/owner/dashboard");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!owner) return <PublicListRoom />;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="container mx-auto flex-1 px-4 py-12">
        <div className="mx-auto max-w-5xl">
          <p className="eyebrow mb-3">
            {t(editId ? "Edit listing" : "Owner listing")}
          </p>

          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="display text-4xl md:text-5xl">
                {t(
                  editId
                    ? "Edit Your Room"
                    : "List a New Room",
                )}
              </h1>

              <p className="mt-3 text-muted-foreground">
                {t(
                  "Complete the details below. Listings are published only after admin approval.",
                )}
              </p>
            </div>

            <Link to="/owner/dashboard">
              <Button
                variant="outline"
                className="rounded-full"
              >
                {t("Owner Dashboard")}
              </Button>
            </Link>
          </div>

          <form
            onSubmit={(e) => submit(e, false)}
            className="space-y-7"
          >
            <Section title={t("1. Basic Information")}>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label={t("Listing Title *")}
                  value={form.title}
                  onChange={(title) =>
                    setForm({ ...form, title })
                  }
                  placeholder={t(
                    "e.g. Single room near Mechi Multiple Campus",
                  )}
                />

                <Select
                  label={t("Room Type *")}
                  value={form.roomType}
                  onChange={(roomType) =>
                    setForm({ ...form, roomType })
                  }
                  options={roomTypes}
                  t={t}
                />

                <Field
                  label={t("Number of Rooms")}
                  type="number"
                  value={form.numberOfRooms}
                  onChange={(numberOfRooms) =>
                    setForm({ ...form, numberOfRooms })
                  }
                />

                <Field
                  label={t("Monthly Rent (NPR) *")}
                  type="number"
                  value={form.monthlyRent}
                  onChange={(monthlyRent) =>
                    setForm({ ...form, monthlyRent })
                  }
                />

                <Field
                  label={t("Security Deposit (NPR)")}
                  type="number"
                  value={form.securityDeposit}
                  onChange={(securityDeposit) =>
                    setForm({ ...form, securityDeposit })
                  }
                />

                <Field
                  label={t("Floor")}
                  value={form.floor}
                  onChange={(floor) =>
                    setForm({ ...form, floor })
                  }
                  placeholder="1st / Ground"
                />

                <Select
                  label={t("Furnished Status")}
                  value={form.furnishedStatus}
                  onChange={(furnishedStatus) =>
                    setForm({ ...form, furnishedStatus })
                  }
                  options={furnishedOptions}
                  t={t}
                />

                <Select
                  label={t("Preferred Tenant")}
                  value={form.preferredTenant}
                  onChange={(preferredTenant) =>
                    setForm({ ...form, preferredTenant })
                  }
                  options={tenantOptions}
                  t={t}
                />
              </div>
            </Section>

            <Section title={t("2. Location & Landmark")}>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label={t("Province *")}
                  value={form.province}
                  onChange={(province) =>
                    setForm({ ...form, province })
                  }
                />

                <Field
                  label={t("District *")}
                  value={form.district}
                  onChange={(district) =>
                    setForm({ ...form, district })
                  }
                />

                <Field
                  label={t("Municipality / City *")}
                  value={form.municipality}
                  onChange={(municipality) =>
                    setForm({ ...form, municipality })
                  }
                />

                <Field
                  label={t("Ward Number")}
                  value={form.ward}
                  onChange={(ward) =>
                    setForm({ ...form, ward })
                  }
                />

                <Field
                  label={t("Area / Tole *")}
                  value={form.area}
                  onChange={(area) =>
                    setForm({ ...form, area })
                  }
                />

                <Field
                  label={t("Street")}
                  value={form.street}
                  onChange={(street) =>
                    setForm({ ...form, street })
                  }
                />

                <div className="sm:col-span-2">
                  <Field
                    label={t("Full Address")}
                    value={form.fullAddress}
                    onChange={(fullAddress) =>
                      setForm({ ...form, fullAddress })
                    }
                    placeholder={t(
                      "House/area details that help a tenant locate the property",
                    )}
                  />
                </div>

                <Field
                  label={t("Nearest Landmark *")}
                  value={form.nearestLandmark}
                  onChange={(nearestLandmark) =>
                    setForm({
                      ...form,
                      nearestLandmark,
                    })
                  }
                  placeholder={t(
                    "e.g. Mechi Multiple Campus",
                  )}
                />

                <Field
                  label={t("Distance from Landmark *")}
                  value={form.landmarkDistance}
                  onChange={(landmarkDistance) =>
                    setForm({
                      ...form,
                      landmarkDistance,
                    })
                  }
                  placeholder={t(
                    "e.g. 500 m / 5 minute walk",
                  )}
                />
              </div>
            </Section>

            <Section title={t("3. Facilities")}>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {facilityOptions.map((name) => (
                  <button
                    type="button"
                    key={name}
                    onClick={() => toggleFacility(name)}
                    className={`flex items-center justify-between rounded-2xl border p-4 text-left text-sm font-semibold transition ${form.facilities.includes(name)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-foreground hover:border-primary/40"
                      }`}
                  >
                    <span>{t(name)}</span>

                    {form.facilities.includes(name) && (
                      <Check className="h-4 w-4" />
                    )}
                  </button>
                ))}
              </div>
            </Section>

            <Section title={t("4. Room Photos")}>
              <p className="mb-4 text-sm text-muted-foreground">
                {t(
                  "Upload at least 5 clear photos. You can add up to 10 photos per listing.",
                )}
              </p>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                {existingImages.map((src, i) => (
                  <div
                    key={`existing-${i}`}
                    className="relative aspect-square overflow-hidden rounded-2xl border"
                  >
                    <img
                      src={src}
                      className="h-full w-full object-cover"
                      alt=""
                    />

                    <span className="absolute bottom-2 left-2 rounded-full bg-card/90 px-2 py-1 text-[10px] font-bold">
                      {i === 0 ? t("Cover") : t("Saved")}
                    </span>

                    <button
                      type="button"
                      onClick={() => removeExisting(i)}
                      className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-destructive"
                      aria-label={t("Remove photo")}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                {previews.map((src, i) => (
                  <div
                    key={`new-${i}`}
                    className="relative aspect-square overflow-hidden rounded-2xl border"
                  >
                    <img
                      src={src}
                      className="h-full w-full object-cover"
                      alt=""
                    />

                    <button
                      type="button"
                      onClick={() => removeNew(i)}
                      className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-destructive"
                      aria-label={t("Remove photo")}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                {totalImages < 10 && (
                  <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 text-primary">
                    <ImagePlus className="h-7 w-7" />

                    <span className="mt-2 text-xs font-bold">
                      {t("Add Photos")}
                    </span>

                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFiles}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <p
                className={`mt-3 text-sm font-semibold ${totalImages >= 5
                    ? "text-primary"
                    : "text-destructive"
                  }`}
              >
                {totalImages}/5 {t("minimum photos added")}
              </p>
            </Section>

            <Section title={t("5. Charges & Availability")}>
              <div className="grid gap-5 sm:grid-cols-2">
                <Select
                  label={t("Electricity Charge")}
                  value={form.charges.electricity}
                  onChange={(electricity) =>
                    setForm({
                      ...form,
                      charges: {
                        ...form.charges,
                        electricity,
                      },
                    })
                  }
                  options={["Included", "Separate"]}
                  t={t}
                />

                <Select
                  label={t("Water Charge")}
                  value={form.charges.water}
                  onChange={(water) =>
                    setForm({
                      ...form,
                      charges: {
                        ...form.charges,
                        water,
                      },
                    })
                  }
                  options={["Included", "Separate"]}
                  t={t}
                />

                <Select
                  label={t("Internet Charge")}
                  value={form.charges.internet}
                  onChange={(internet) =>
                    setForm({
                      ...form,
                      charges: {
                        ...form.charges,
                        internet,
                      },
                    })
                  }
                  options={["Included", "Separate"]}
                  t={t}
                />

                <Field
                  label={t("Available From")}
                  type="date"
                  value={form.availableFrom}
                  onChange={(availableFrom) =>
                    setForm({ ...form, availableFrom })
                  }
                />

                <Select
                  label={t("Preferred Contact")}
                  value={form.preferredContact}
                  onChange={(preferredContact) =>
                    setForm({
                      ...form,
                      preferredContact,
                    })
                  }
                  options={["Phone", "WhatsApp", "Email"]}
                  t={t}
                />

                <div>
                  <Label>{t("Show phone publicly")}</Label>

                  <div className="mt-2 flex gap-2">
                    {[true, false].map((value) => (
                      <button
                        type="button"
                        key={String(value)}
                        onClick={() =>
                          setForm({
                            ...form,
                            showPhone: value,
                          })
                        }
                        className={`rounded-full border px-4 py-2 text-sm font-semibold ${form.showPhone === value
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border"
                          }`}
                      >
                        {t(value ? "Yes" : "No")}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Section>

            <Section title={t("6. Owner Contact")}>
              <div className="grid gap-4 sm:grid-cols-3">
                <ReadOnly
                  label={t("Owner Name")}
                  value={owner.fullName}
                />

                <ReadOnly
                  label={t("Phone")}
                  value={owner.phone}
                />

                <ReadOnly
                  label={t("Email")}
                  value={owner.email}
                />
              </div>
            </Section>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={(e) => submit(e, true)}
                className="rounded-full px-6"
              >
                {t("Save as Draft")}
              </Button>

              <Button
                type="submit"
                disabled={loading}
                className="rounded-full px-8 font-bold"
              >
                {loading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}

                {t(
                  editId
                    ? "Save Changes"
                    : "Submit Listing",
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

const Section = ({ title, children }) => (
  <section className="soft-card p-6 md:p-8">
    <h2 className="mb-6 text-xl font-extrabold text-foreground">
      {title}
    </h2>
    {children}
  </section>
);

const Field = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
}) => (
  <div>
    <Label>{label}</Label>

    <Input
      className="mt-1"
      type={type}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  </div>
);

const Select = ({
  label,
  value,
  onChange,
  options,
  t,
}) => (
  <div>
    <Label>{label}</Label>

    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {t(option)}
        </option>
      ))}
    </select>
  </div>
);

const ReadOnly = ({ label, value }) => (
  <div className="rounded-2xl bg-secondary/60 p-4">
    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
      {label}
    </p>

    <p className="mt-1 font-semibold">{value}</p>
  </div>
);

export default ListRoom;