<div class="modal fade" id="importResultModal" tabindex="-1" aria-labelledby="importResultModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
            <div class="modal-header">
                <div>
                    <h5 class="modal-title fw-semibold" id="importResultModalLabel"> Import Completed</h5>
                    <p class="text-secondary small mb-0" id="importResultMessage">Your student records have been processed.</p>
                </div>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div class="row g-3 mb-4"> 
                    <!-- Imported --> 
                    <div class="col-6">
        <div class="border rounded p-3 bg-success-subtle h-100">
            <div class="row align-items-center">

                <div class="col-5 text-center">
                    <div class="fs-3 fw-semibold text-success" id="modalImported">
                        0
                    </div>
                </div>

                <div class="col-7 border-start border-secondary-subtle">
                    <div class="small text-secondary">Imported</div>
                    <div class="small text-secondary">students</div>
                </div>

            </div>
        </div>
    </div>
                    <!-- Skipped --> 
                     <div class="col-6">
        <div class="border rounded p-3 bg-warning-subtle h-100">
            <div class="row align-items-center">

                <div class="col-5 text-center">
                    <div class="fs-3 fw-semibold text-warning" id="modalSkipped">
                        0
                    </div>
                </div>

                <div class="col-7 border-start border-secondary-subtle">
                    <div class="small text-secondary">Skipped</div>
                    <div class="small text-secondary">rows</div>
                </div>

            </div>
        </div>
    </div> 
                </div>
                <div id="skippedRowsContainer" class="d-none">
                    <!-- Clickable summary --> 
                    <button type="button" class="btn btn-light border w-100 d-flex justify-content-between align-items-center mb-2" data-bs-toggle="collapse" data-bs-target="#skippedRowsDetails" aria-expanded="false" aria-controls="skippedRowsDetails" >
                        <span class="fw-semibold"> 
                            <i class="bi bi-exclamation-circle me-2 text-warning"></i> Skipped Rows 
                        </span> 
                        <span class="d-flex align-items-center gap-2"> 
                            <span class="badge rounded-pill text-warning bg-warning-subtle" id="skippedRowsCount" > 0 </span> 
                            <i class="bi bi-chevron-down"></i> 
                        </span> 
                    </button> 
                    <!-- Hidden details --> 
                    <div class="collapse" id="skippedRowsDetails"> 
                        <div class="table-responsive border rounded" style="max-height: 220px; overflow-y: auto;" > 
                            <table class="table table-sm table-hover mb-0"> 
                                <thead class="table-light"> 
                                    <tr> 
                                        <th>Row</th> 
                                        <th>Reason</th> 
                                    </tr> 
                                </thead> 
                                <tbody id="skippedRowsTable">
                                    
                                </tbody> 
                            </table> 
                        </div> 
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Done</button>
            </div>
        </div>
    </div>
</div>