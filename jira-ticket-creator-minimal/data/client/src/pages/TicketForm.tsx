import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, AlertCircle, Plus, X } from "lucide-react";
import { toast } from "sonner";

interface TechForm {
  id: string;
  technology: string;
  solutionCode: string;
  environment: string;
  cpu?: number;
  ram?: number;
  dbEngine?: string;
  diskSize?: number;
  storageType?: string;
  storageQuota?: number;
}

const PREDEFINED_TECHNOLOGIES = ["VM", "Kubernetes", "Database", "Middleware", "Storage"];
const ENVIRONMENT_OPTIONS = ["DEV", "INT", "UAT", "PROD"];

export default function TicketForm() {
  const [squad, setSquad] = useState("");
  const [email, setEmail] = useState("");
  const [technologies, setTechnologies] = useState<TechForm[]>([
    { id: "1", technology: "", solutionCode: "", environment: "" }
  ]);
  const [customTechs, setCustomTechs] = useState<string[]>([]);
  const [successResults, setSuccessResults] = useState<Array<{ key: string; url: string }> | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const createTicketsMutation = trpc.ticket.createMultiple.useMutation({
    onSuccess: (data) => {
      setSuccessResults(data);
      setErrorMessage(null);
      setSquad("");
      setEmail("");
      setTechnologies([{ id: "1", technology: "", solutionCode: "", environment: "" }]);
      toast.success(`${data.length} ticket(s) créé(s) avec succès!`);
    },
    onError: (error) => {
      setErrorMessage(error.message || "Erreur lors de la création des tickets");
      toast.error("Erreur lors de la création des tickets");
    },
  });

  const handleAddTechnology = () => {
    const newId = String(Math.max(...technologies.map(t => parseInt(t.id)), 0) + 1);
    setTechnologies([
      ...technologies,
      { id: newId, technology: "", solutionCode: "", environment: "" }
    ]);
  };

  const handleRemoveTechnology = (id: string) => {
    if (technologies.length > 1) {
      setTechnologies(technologies.filter(t => t.id !== id));
    } else {
      toast.error("Vous devez avoir au moins une technologie");
    }
  };

  const handleTechChange = (id: string, field: string, value: any) => {
    setTechnologies(
      technologies.map(t =>
        t.id === id ? { ...t, [field]: value } : t
      )
    );
  };

  const handleEnvironmentToggle = (id: string, env: string) => {
    const tech = technologies.find(t => t.id === id);
    if (!tech) return;

    const currentEnvs = tech.environment ? tech.environment.split("+") : [];
    const newEnvs = currentEnvs.includes(env)
      ? currentEnvs.filter(e => e !== env)
      : [...currentEnvs, env];

    handleTechChange(id, "environment", newEnvs.join("+"));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!squad || !email) {
      setErrorMessage("Squad et Email sont requis");
      return;
    }

    if (technologies.length === 0) {
      setErrorMessage("Veuillez ajouter au moins une technologie");
      return;
    }

    for (const tech of technologies) {
      if (!tech.technology || !tech.solutionCode || !tech.environment) {
        setErrorMessage("Tous les champs obligatoires doivent être remplis pour chaque technologie");
        return;
      }

      if (
        (tech.technology === "VM" || tech.technology === "Kubernetes") &&
        (!tech.cpu || !tech.ram)
      ) {
        setErrorMessage(`CPU et RAM sont requis pour ${tech.technology}`);
        return;
      }

      if (tech.technology === "Database" && (!tech.dbEngine || !tech.diskSize)) {
        setErrorMessage("Type de moteur et taille disque sont requis pour Database");
        return;
      }

      if (tech.technology === "Storage" && (!tech.storageType || !tech.storageQuota)) {
        setErrorMessage("Type et quota de stockage sont requis pour Storage");
        return;
      }
    }

    createTicketsMutation.mutate({
      squad,
      email,
      technologies: technologies.map(t => ({
        technology: t.technology,
        solutionCode: t.solutionCode,
        environment: t.environment,
        cpu: t.cpu,
        ram: t.ram,
        dbEngine: t.dbEngine,
        diskSize: t.diskSize,
        storageType: t.storageType,
        storageQuota: t.storageQuota,
      })),
    });
  };

  const allTechs = [...PREDEFINED_TECHNOLOGIES, ...customTechs];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Demande Technique AppOps</h1>
          <p className="text-slate-600">Créez automatiquement des tickets Jira en quelques clics</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Nouveau(x) Ticket(s)</CardTitle>
            <CardDescription>Remplissez le formulaire pour créer un ou plusieurs tickets Jira</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMessage && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              {/* Champs communs */}
              <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 space-y-4">
                <h3 className="font-semibold text-slate-900 text-lg">Informations Communes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="squad" className="text-base font-semibold">
                      Squad *
                    </Label>
                    <Input
                      id="squad"
                      placeholder="ex: Phoenix"
                      value={squad}
                      onChange={(e) => setSquad(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-base font-semibold">
                      Email *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre-email@entreprise.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Formulaires par technologie */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-slate-900 text-lg">Technologie(s)</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddTechnology}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Ajouter une technologie
                  </Button>
                </div>

                {technologies.map((tech, index) => (
                  <Card key={tech.id} className="border-2 border-slate-200 relative">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">Technologie {index + 1}</CardTitle>
                        {technologies.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveTechnology(tech.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-5 w-5" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Technologie */}
                      <div className="space-y-2">
                        <Label className="text-base font-semibold">
                          Technologie *
                        </Label>
                        <Select
                          value={tech.technology}
                          onValueChange={(value) => handleTechChange(tech.id, "technology", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une technologie" />
                          </SelectTrigger>
                          <SelectContent>
                            {allTechs.map((t) => (
                              <SelectItem key={t} value={t}>
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Code Solution et Environnement */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-base font-semibold">
                            Code Solution *
                          </Label>
                          <Input
                            placeholder="ex: S999"
                            value={tech.solutionCode}
                            onChange={(e) => handleTechChange(tech.id, "solutionCode", e.target.value)}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-base font-semibold">
                            Environnement(s) *
                          </Label>
                          <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-white">
                            {ENVIRONMENT_OPTIONS.map((env) => (
                              <button
                                key={env}
                                type="button"
                                onClick={() => handleEnvironmentToggle(tech.id, env)}
                                className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                                  tech.environment?.includes(env)
                                    ? "bg-blue-600 text-white"
                                    : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                                }`}
                              >
                                {env}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Champs conditionnels - VM / Kubernetes */}
                      {(tech.technology === "VM" || tech.technology === "Kubernetes") && (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-4">
                          <h4 className="font-semibold text-blue-900">Spécifications Compute</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-base font-semibold">
                                CPU (Cores) *
                              </Label>
                              <Input
                                type="number"
                                min="1"
                                placeholder="ex: 4"
                                value={tech.cpu || ""}
                                onChange={(e) => handleTechChange(tech.id, "cpu", e.target.value ? parseInt(e.target.value) : undefined)}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-base font-semibold">
                                RAM (GB) *
                              </Label>
                              <Input
                                type="number"
                                min="1"
                                placeholder="ex: 8"
                                value={tech.ram || ""}
                                onChange={(e) => handleTechChange(tech.id, "ram", e.target.value ? parseInt(e.target.value) : undefined)}
                                required
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Champs conditionnels - Database */}
                      {tech.technology === "Database" && (
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200 space-y-4">
                          <h4 className="font-semibold text-green-900">Spécifications Base de Données</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-base font-semibold">
                                Type de Moteur *
                              </Label>
                              <Select
                                value={tech.dbEngine || ""}
                                onValueChange={(value) => handleTechChange(tech.id, "dbEngine", value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner un moteur" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="PostgreSQL">PostgreSQL</SelectItem>
                                  <SelectItem value="MySQL">MySQL</SelectItem>
                                  <SelectItem value="MongoDB">MongoDB</SelectItem>
                                  <SelectItem value="Oracle">Oracle</SelectItem>
                                  <SelectItem value="SQL Server">SQL Server</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-base font-semibold">
                                Taille Disque (GB) *
                              </Label>
                              <Input
                                type="number"
                                min="1"
                                placeholder="ex: 100"
                                value={tech.diskSize || ""}
                                onChange={(e) => handleTechChange(tech.id, "diskSize", e.target.value ? parseInt(e.target.value) : undefined)}
                                required
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Champs conditionnels - Storage */}
                      {tech.technology === "Storage" && (
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 space-y-4">
                          <h4 className="font-semibold text-purple-900">Spécifications Stockage</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-base font-semibold">
                                Type de Stockage *
                              </Label>
                              <Select
                                value={tech.storageType || ""}
                                onValueChange={(value) => handleTechChange(tech.id, "storageType", value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner un type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="S3">S3 (AWS)</SelectItem>
                                  <SelectItem value="NFS">NFS</SelectItem>
                                  <SelectItem value="GCS">Google Cloud Storage</SelectItem>
                                  <SelectItem value="Azure Blob">Azure Blob Storage</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-base font-semibold">
                                Quota (GB) *
                              </Label>
                              <Input
                                type="number"
                                min="1"
                                placeholder="ex: 500"
                                value={tech.storageQuota || ""}
                                onChange={(e) => handleTechChange(tech.id, "storageQuota", e.target.value ? parseInt(e.target.value) : undefined)}
                                required
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Bouton de soumission */}
              <Button
                type="submit"
                disabled={createTicketsMutation.isPending}
                className="w-full h-12 text-lg font-semibold"
              >
                {createTicketsMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  `Créer ${technologies.length} Ticket${technologies.length > 1 ? "s" : ""} Jira`
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Messages de succès */}
        {successResults && (
          <div className="mt-6 space-y-4">
            {successResults.map((result, index) => (
              <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-green-900 mb-2">Ticket {index + 1} créé avec succès!</h3>
                    <p className="text-green-800 mb-4">
                      Clé du ticket: <span className="font-mono font-bold">{result.key}</span>
                    </p>
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition"
                    >
                      Voir le ticket Jira
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
