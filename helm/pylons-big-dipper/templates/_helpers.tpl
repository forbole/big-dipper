{{- define "ports.service" }}
{{- range $key, $value := .Values.ports }}
- port: {{ $v := $value | toString | splitList ":" }}{{$v | first}}
  name: {{ $key }}
  targetPort: {{ $v := $value | toString | splitList ":" }}{{$v | last}}
{{- end }}
{{- end }}

{{- define "ports.pod" }}
{{- range $key, $value := .Values.ports }}
  - containerPort: {{ $v := $value | toString | splitList ":" }}{{$v | last}}
    name: {{ $key }}
{{- end }}
{{- end }}

{{- define "chart.labels" }}
app.kubernetes.io/name: {{ .Chart.Name }}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version | replace "+" "_" }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion }}
{{- if .Values.labels }}{{ toYaml .Values.labels}}{{- end }}
{{- end }}